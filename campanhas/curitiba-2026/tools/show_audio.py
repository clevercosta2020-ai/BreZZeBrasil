# Show video soundtrack: 3 s real-footage hook (heartbeat, low-battery beeps, tension riser, power-down)
# then music (100 BPM) from the drop at 3.0 s.
import numpy as np, wave, sys
SR = 48000; T = 30.0; N = int(SR * T); out = np.zeros((N, 2)); rng = np.random.default_rng(5)
def read(p):
    with wave.open(p) as w: return np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768
def add(sig, start, g=1.0):
    i = int(start * SR); j = min(N, i + len(sig)); out[i:j] += (sig[:j - i] * g)[:, None]
def thump():
    n = int(.22 * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * (48 + 40 * np.exp(-x * 30)) * x) * np.exp(-x * 18)
for b in [0.0, .6, 1.15, 1.65, 2.1, 2.45, 2.75]: add(thump(), b, .9); add(thump() * .6, b + .15, .9)
def beep(fq=2100, d=.07):
    n = int(d * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * fq * x) * np.minimum(1, x / .004) * np.minimum(1, (d - x) / .01)
for a in [0.15, 1.25, 2.45]:
    for k in range(3): add(beep(), a + k * .1, .3)
n = int(2.9 * SR); x = np.arange(n) / SR; lp = np.cumsum(rng.standard_normal(n)); lp -= np.convolve(lp, np.ones(400) / 400, 'same')
add(lp / np.abs(lp).max() * (x / 2.9) ** 2.5, 0.1, .5)                                   # tension riser
n = int(.3 * SR); x = np.arange(n) / SR; fq = 900 * np.exp(-x * 9) + 40
add((2 * ((np.cumsum(fq) / SR) % 1) - 1) * np.exp(-x * 5), 2.66, .3)                     # power-down
mus = read(sys.argv[1]); i = int(2.6 * SR); j = min(N, i + len(mus)); out[i:j] += mus[:j - i] * .95
out = np.tanh(out * 1.1); out /= np.abs(out).max() / .89
fo = int(1.0 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
with wave.open(sys.argv[2], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
