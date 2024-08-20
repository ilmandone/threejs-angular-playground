
vec3 coords = normal;
coords.y += uTime;
vec3 noisePattern = vec3(noise(coords / 1.5));
float pattern = clamp(wave(noisePattern + uTime), 0.3,0.8);

// varyings
vDisplacement = pattern;


float displacement = vDisplacement / 3.0;

transformed += normalize(objectNormal) * displacement;