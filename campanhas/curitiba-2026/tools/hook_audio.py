# Builds the final 30 s soundtrack: 4 s stress hook (siren, alarm beeps, heartbeat, power-off)
# + the original 28 s music compressed to 26 s (same factor K as the video timeline).
import numpy as np, wave, sys
SR = 48000; OFF = 4.0; K = 26 / 28; T = 30.0
rng = np.random.default_rng(3)
def read(p):
    with wave.open(p) as w: x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768
    return x
music = read(sys.argv[1])
n_new = int(len(music) * K); idx = np.linspace(0, len(music) - 1, n_new)
mus = np.stack([np.interp(idx, np.arange(len(music)), music[:, c]) for c in (0, 1)], 1)
N = int(SR * T); out = np.zeros((N, 2)); t = np.arange(N) / SR
def add(sig, start, g=1.0, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig)); s = sig[:j - i] * g
    out[i:j, 0] += s * (1 - pan); out[i:j, 1] += s * (1 + pan)
# siren: two-tone hi-lo with glide, 0.05–3.4 s
d = 3.35; tt = np.arange(int(d * SR)) / SR
sq = (np.sin(2 * np.pi * tt / 0.64) > 0).astype(float)
sq = np.convolve(sq, np.ones(1200) / 1200, 'same')            # soft glide between tones
f = 760 + 300 * sq; ph = 2 * np.pi * np.cumsum(f) / SR
sir = (np.sin(ph) + .35 * np.sin(3 * ph) + .15 * np.sin(5 * ph)) * (0.75 + .25 * np.sin(2 * np.pi * 6 * tt))
sir *= np.minimum(1, tt / .15) * np.minimum(1, (d - tt) / .25)
add(sir, 0.05, .16)
# heartbeat (accelerating)
def thump():
    n = int(.22 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (48 + 40 * np.exp(-x * 30)) * x) * np.exp(-x * 18)
for b in [0.0, .55, 1.05, 1.5, 1.9, 2.25, 2.58, 2.88, 3.15]:
    add(thump(), b, .9); add(thump() * .6, b + .16, .9)
# low-battery alarm beeps on each alert
def beep(fq=2100, dur=.07):
    n = int(dur * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * fq * x) * np.minimum(1, x / .004) * np.minimum(1, (dur - x) / .01)
for a in [0.7, 2.0, 2.95]:
    for k in range(3): add(beep(), a + k * .1, .32)
# glitch whooshes at vignette changes
for w in [1.3, 2.6, 3.55]:
    n = int(.16 * SR); x = rng.standard_normal(n); x = np.diff(np.concatenate([[0], x])) * np.exp(-np.arange(n) / SR * 25)
    add(x, w - .04, .35)
# power-off sweep
n = int(.4 * SR); x = np.arange(n) / SR; fq = 900 * np.exp(-x * 7) + 40
po = (2 * ((np.cumsum(fq) / SR) % 1) - 1) * np.exp(-x * 4)
add(po, 3.38, .35)
# music from OFF
i = int(OFF * SR); j = min(N, i + len(mus)); out[i:j] += mus[:j - i] * .95
out = np.tanh(out * 1.1); out /= np.abs(out).max() / .89
fo = int(1.0 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
