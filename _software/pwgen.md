---
layout: software
category: software

title: Password Generator
subtitle: Entropy-aware password generation
date: 2022-06-30

tags:
  - web
  - javascript

thumbnail: /img/tweakey/thumb.png
---
<form>
  <fieldset id="controlFieldset" disabled>
    <div style="display: flex">
      <input id="entropySlider" type="range" value="80" min="0" max="128" style="flex-grow: 1" />
      <input id="entropyField" type="text" value="80" size="3" />
      <input id="entropyButton" type="button" value="Reset" />
    </div>
    <div style="display: flex">
      <input id="seedField" type="text" value="b305da5415185a6faa25795ebf9848bb" style="flex-grow: 1; font-family: monospace" />
      <input id="seedButton" type="button" value="Reseed" />
    </div>
  </fieldset>
</form>

<style>
*[id="passwordTable"] > * {
  padding: 0.4em;
}

*[id="passwordTable"] > *:nth-child(even) {
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>

<div id="passwordTable" style="display: grid; grid-template-columns: auto 1fr;">
  <span>Method</span><span>Password</span>
  <!-- Passwords -->
  <span>ASCII</span><pre data-method="ascii"></pre>
  <span>Alphabetic</span><pre data-method="alpha"></pre>
  <span>Numeric</span><pre data-method="numeric"></pre>
  <!-- Pass phrases -->
  <span><a href="https://theworld.com/~reinhold/diceware.html">Diceware</a></span><pre data-method="diceware"></pre>
  <span><a href="https://www.eff.org/dice">EFF Long</a></span><pre data-method="eff_l"></pre>
  <span><a href="https://www.eff.org/dice">EFF Short #1</a></span><pre data-method="eff_s1"></pre>
  <span><a href="https://www.eff.org/dice">EFF Short #2</a></span><pre data-method="eff_s2"></pre>
  <!-- N-grams -->
  <span>Monograms</span><pre data-method="monograms"></pre>
  <span>Bigrams</span><pre data-method="bigrams"></pre>
  <span>Trigrams</span><pre data-method="trigrams"></pre>
  <span>Quadgrams</span><pre data-method="quadgrams"></pre>
  <!-- Reweighted N-grams -->
  <span>Monograms 50<sup>th</sup></span><pre data-method="monograms50"></pre>
  <span>Bigrams 50<sup>th</sup></span><pre data-method="bigrams50"></pre>
  <span>Trigrams 50<sup>th</sup></span><pre data-method="trigrams50"></pre>
  <span>Quadgrams 50<sup>th</sup></span><pre data-method="quadgrams50"></pre>
</div>

<script type="module">
import * as pwlib from "/js/pwlib.mjs";

import { wordlist as diceware } from "/js/diceware.mjs";
import { wordlist as eff_long } from "/js/eff_l.mjs";
import { wordlist as eff_short1 } from "/js/eff_s1.mjs";
import { wordlist as eff_short2 } from "/js/eff_s2.mjs";

const lower = pwlib.charRange("a", "z");
const upper = pwlib.charRange("A", "Z");
const numeric = pwlib.charRange("0", "9");
const symbols = pwlib.charRange(" ", "/") + pwlib.charRange(":", "@") + pwlib.charRange("[", "`") + pwlib.charRange("{", "~");

const monograms = pwlib.loadNgrams(eff_long, 1);
const bigrams = pwlib.loadNgrams(eff_long, 2);
const trigrams = pwlib.loadNgrams(eff_long, 3);
const quadgrams = pwlib.loadNgrams(eff_long, 4);

const monograms50 = pwlib.reweightNgrams(monograms, 0.50);
const bigrams50 = pwlib.reweightNgrams(bigrams, 0.50);
const trigrams50 = pwlib.reweightNgrams(trigrams, 0.50);
const quadgrams50 = pwlib.reweightNgrams(quadgrams, 0.50);

const methods = {
  // Passwords
  ascii: (drbg, entropy) => pwlib.generatePassword(drbg, entropy, lower + upper + numeric + symbols),
  alpha: (drbg, entropy) => pwlib.generatePassword(drbg, entropy, lower),
  numeric: (drbg, entropy) => pwlib.generatePassword(drbg, entropy, numeric),
  // Pass phrases
  diceware: (drbg, entropy) => pwlib.generatePassphrase(drbg, entropy, diceware),
  eff_l: (drbg, entropy) => pwlib.generatePassphrase(drbg, entropy, eff_long),
  eff_s1: (drbg, entropy) => pwlib.generatePassphrase(drbg, entropy, eff_short1),
  eff_s2: (drbg, entropy) => pwlib.generatePassphrase(drbg, entropy, eff_short2),
  // N-grams
  monograms: (drbg, entropy) => pwlib.generatePassgram(drbg, entropy, monograms),
  bigrams: (drbg, entropy) => pwlib.generatePassgram(drbg, entropy, bigrams),
  trigrams: (drbg, entropy) => pwlib.generatePassgram(drbg, entropy, trigrams),
  quadgrams: (drbg, entropy) => pwlib.generatePassgram(drbg, entropy, quadgrams),
  // N-grams
  monograms50: (drbg, entropy) => pwlib.generatePassgram(drbg, entropy, monograms50),
  bigrams50: (drbg, entropy) => pwlib.generatePassgram(drbg, entropy, bigrams50),
  trigrams50: (drbg, entropy) => pwlib.generatePassgram(drbg, entropy, trigrams50),
  quadgrams50: (drbg, entropy) => pwlib.generatePassgram(drbg, entropy, quadgrams50),
};

let entropySlider = document.getElementById("entropySlider");
let entropyField = document.getElementById("entropyField");
let seedField = document.getElementById("seedField");

function regenerate(event) {
  // Sync redundant inputs.
  if (event && event.srcElement == entropySlider) {
    entropyField.value = entropySlider.value;
  } else if (event && event.srcElement == entropyField) {
    entropySlider.value = entropyField.value;
  }

  // Collect inputs
  let targetEntropy = entropySlider.value;
  // TODO: Hash if not perfect-length hex.
  let seed = hex2buf(seedField.value);

  // Generation
  // TOOD: Don't queue more than one async generation.
  let divs = document.querySelectorAll("#passwordTable *[data-method]");
  for (let div of divs) {
    pwlib.DRBG.from(seed).then((drbg) => {
      let methodName = div.attributes["data-method"].value;
      let methodFunc = methods[methodName];
      methodFunc(drbg, targetEntropy).then((result) => { div.innerHTML = result; });
    });
  }
}

function resetEntropy() {
  entropySlider.value = 80;
  entropyField.value = 80;
  regenerate(null);
}

function reseed() {
  let binarySeed = window.crypto.getRandomValues(new Uint8Array(16));
  let hexSeed = buf2hex(binarySeed);
  seedField.value = hexSeed;
  regenerate(null);
}

// https://stackoverflow.com/a/71083193
function hex2buf(hex) {
  return new Uint8Array(hex.match(/../g).map(h=>parseInt(h, 16)));
}

// https://stackoverflow.com/a/40031979
function buf2hex(buffer) {
  return [...buffer]
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
}

entropySlider.addEventListener('input', regenerate);
entropyField.addEventListener('input', regenerate);
seedField.addEventListener('input', regenerate);

document.getElementById("entropyButton").addEventListener('click', resetEntropy);
document.getElementById("seedButton").addEventListener('click', reseed);

controlFieldset.disabled = false;
// let pwlibScript = document.createElement('script');
// pwlibScript.src = '/js/pwlib.mjs';
// pwlibScript.type = "module";
// pwlibScript.addEventListener('load', (event) => {
//   controlFieldset = document.getElementById("controlFieldset");
//   controlFieldset.disabled = false;
// });

// let pwgenScript = document.getElementById("pwgenScript");
// pwgenScript.appendChild(pwlibScript);

</script>
