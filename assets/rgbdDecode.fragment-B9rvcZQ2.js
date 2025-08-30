import{by as r}from"./pointsCloudSystem-2vcS-S4d.js";import"./helperFunctions-Dt8Ez0m5.js";import"./index-rhFFGTpy.js";import"./motion-3WHHzQTP.js";import"./vendor-CIP6LD3P.js";const e="rgbdDecodePixelShader",t=`varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=vec4f(fromRGBD(textureSample(textureSampler,textureSamplerSampler,input.vUV)),1.0);}`;r.ShadersStoreWGSL[e]||(r.ShadersStoreWGSL[e]=t);const n={name:e,shader:t};export{n as rgbdDecodePixelShaderWGSL};
//# sourceMappingURL=rgbdDecode.fragment-B9rvcZQ2.js.map
