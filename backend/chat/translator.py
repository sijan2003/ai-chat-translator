"""
translator.py

Provides real-time translation using Hugging Face's MarianMT models for a Django chat application.
Optimized for low memory and fast execution, with LRU model/tokenizer caching for WebSocket use.
Compatible with Python 3.11.9 and Django Channels.
"""

import logging
from typing import Optional, Tuple
from threading import Lock
from collections import OrderedDict
import os

from transformers import MarianMTModel, MarianTokenizer
import torch

# Supported language pairs (expand as needed)
SUPPORTED_LANGUAGE_PAIRS = {
    ("en", "es"): "Helsinki-NLP/opus-mt-en-es",
    ("es", "en"): "Helsinki-NLP/opus-mt-es-en",
    ("en", "fr"): "Helsinki-NLP/opus-mt-en-fr",
    ("fr", "en"): "Helsinki-NLP/opus-mt-fr-en",
    ("en", "de"): "Helsinki-NLP/opus-mt-en-de",
    ("de", "en"): "Helsinki-NLP/opus-mt-de-en",
    # Add more pairs as needed
}

FALLBACK_MESSAGE = "[Translation unavailable for the selected language pair.]"
DEFAULT_CACHE_SIZE = int(os.environ.get("TRANSLATOR_MODEL_CACHE_SIZE", 2))  # Heroku free tier: keep this low

class ModelCache:
    """
    Thread-safe LRU cache for MarianMT models and tokenizers.
    """
    def __init__(self, max_size: int = DEFAULT_CACHE_SIZE):
        self.max_size = max_size
        self.models = OrderedDict()
        self.tokenizers = OrderedDict()
        self.lock = Lock()

    def get(self, model_name: str) -> Optional[Tuple[MarianMTModel, MarianTokenizer]]:
        with self.lock:
            if model_name in self.models:
                # Move to end to mark as recently used
                self.models.move_to_end(model_name)
                self.tokenizers.move_to_end(model_name)
                return self.models[model_name], self.tokenizers[model_name]
            return None

    def set(self, model_name: str, model: MarianMTModel, tokenizer: MarianTokenizer):
        with self.lock:
            if model_name in self.models:
                self.models.move_to_end(model_name)
                self.tokenizers.move_to_end(model_name)
            self.models[model_name] = model
            self.tokenizers[model_name] = tokenizer
            if len(self.models) > self.max_size:
                # Remove least recently used
                old_model, old_tokenizer = self.models.popitem(last=False), self.tokenizers.popitem(last=False)
                del old_model, old_tokenizer  # Help GC

    def clear(self):
        with self.lock:
            self.models.clear()
            self.tokenizers.clear()

_model_cache = ModelCache()

def get_model_and_tokenizer(src_lang: str, tgt_lang: str) -> Optional[Tuple[MarianMTModel, MarianTokenizer]]:
    """
    Retrieve or load the MarianMT model and tokenizer for the given language pair.
    Uses a thread-safe LRU cache to minimize memory and latency.
    """
    pair = (src_lang, tgt_lang)
    model_name = SUPPORTED_LANGUAGE_PAIRS.get(pair)
    if not model_name:
        return None
    cached = _model_cache.get(model_name)
    if cached:
        return cached
    try:
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        _model_cache.set(model_name, model, tokenizer)
        return model, tokenizer
    except (OSError, ValueError) as e:
        logging.error(f"Failed to load model/tokenizer for {model_name}: {e}")
        return None

def translate(text: str, src_lang: str, tgt_lang: str) -> str:
    """
    Translate text from src_lang to tgt_lang using MarianMT.
    Returns the translated string, or a fallback message on error.
    """
    if not text or not isinstance(text, str):
        return FALLBACK_MESSAGE
    if src_lang == tgt_lang:
        return text  # No translation needed
    result = get_model_and_tokenizer(src_lang, tgt_lang)
    if not result:
        return FALLBACK_MESSAGE
    model, tokenizer = result
    try:
        with torch.no_grad():
            inputs = tokenizer([text], return_tensors="pt", truncation=True, max_length=512)
            translated = model.generate(**inputs, max_length=512, num_beams=3, early_stopping=True)
            tgt_text = tokenizer.batch_decode(translated, skip_special_tokens=True)[0]
        return tgt_text
    except Exception as e:
        logging.error(f"Translation error for '{text}' ({src_lang}->{tgt_lang}): {e}")
        return FALLBACK_MESSAGE

# Example usage (remove or comment out in production):
# print(translate("Hello, how are you?", "en", "es")) 