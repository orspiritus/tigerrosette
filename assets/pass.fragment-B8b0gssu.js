import{by as r}from"./pointsCloudSystem-2vcS-S4d.js";import"./index-rhFFGTpy.js";import"./motion-3WHHzQTP.js";import"./vendor-CIP6LD3P.js";const e="passPixelShader",t=`varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=textureSample(textureSampler,textureSamplerSampler,input.vUV);}`;r.ShadersStoreWGSL[e]||(r.ShadersStoreWGSL[e]=t);const n={name:e,shader:t};export{n as passPixelShaderWGSL};
//# sourceMappingURL=pass.fragment-B8b0gssu.js.map
