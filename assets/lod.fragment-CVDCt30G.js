import{by as r}from"./pointsCloudSystem-2vcS-S4d.js";import"./index-rhFFGTpy.js";import"./motion-3WHHzQTP.js";import"./vendor-CIP6LD3P.js";const o="lodPixelShader",e=`#extension GL_EXT_shader_texture_lod : enable
precision highp float;const float GammaEncodePowerApprox=1.0/2.2;varying vec2 vUV;uniform sampler2D textureSampler;uniform float lod;uniform vec2 texSize;uniform int gamma;void main(void)
{gl_FragColor=texture2DLodEXT(textureSampler,vUV,lod);if (gamma==0) {gl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(GammaEncodePowerApprox));}}
`;r.ShadersStore[o]||(r.ShadersStore[o]=e);const l={name:o,shader:e};export{l as lodPixelShader};
//# sourceMappingURL=lod.fragment-CVDCt30G.js.map
