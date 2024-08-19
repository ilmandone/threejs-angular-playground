uniform float uTime;
uniform float uRadius;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    uv -= vec2(0.5);
    uv *= 2.0;

    // vec3(step(uRadius, length(uv))
    // fract(vUv.x * 10.)
    // step(0.5,mod(vUv.x * 10., 3.))
    // mix(0.5, 1., vUv.x)

    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = 1. - dot(viewDirection, vNormal);

    vec3 color = vec3(1,0,0);
    gl_FragColor = vec4(vec3(fresnel) , 1);
}
