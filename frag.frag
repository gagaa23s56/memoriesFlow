#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Part 2 - Step 1
// from here
uniform float u_colorAAmount;
uniform float u_colorBAmount;
uniform float u_colorCAmount;
uniform float u_scale;

uniform sampler2D u_texBase;
// to here

#define times 6.;

vec2 hash2( vec2 x )           //亂數範圍 [0,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float gnoise( in vec2 p )       //亂數範圍 [0,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );   
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float draw( in vec2 st , in float scale, in float move, in float theshold){
    vec3 color_all = vec3(0.);
    for(int i = 0; i < 5; i++){
        vec3 color_t = vec3(0.);
        vec2 noisest = st * pow(scale,float(i)) +move*float(i);
        color_t =vec3(smoothstep(0.120,.9 + cos(u_time/4.*float(i))*.15,noise(noisest))) - vec3(smoothstep(0.464,.8 + cos(u_time/4.*float(i))*.2,noise(noisest)));	
        color_all+= color_t*.7;
        if(theshold < float(i)/5.) break;
    }
    return float(color_all);
}

float mouseEffect(vec2 uv, vec2 mouse, float size)
{
    float dist=length(uv-mouse);
    return 1.-smoothstep(size*15., size, dist);  //size
    //return pow(dist, 0.5);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 uv = st*2. - 1.;
    // st /= 2.;
    vec2 mouseMove = u_mouse.xy/u_resolution.xy;
    mouseMove.x *= u_resolution.x/u_resolution.y/1.77; 
    st.x *= u_resolution.x/u_resolution.y/1.77;  
    // st.x -= u_resolution.x/(u_resolution.y*4.);
    uv.x *= u_resolution.x/u_resolution.y/1.77;
    float interact = mouseEffect(st, mouseMove, .01)*.25;  
    
    vec4 info = texture2D(u_texBase,st); // 讀取圖檔（u_tex0），以uv的方式讀
    vec3 pic = vec3(1.) - info.rgb;
    pic.r  = pic.r * (1. - gnoise(vec2(st.x, st.y*100.)));
    pic.g  = pic.g * (1. - gnoise(vec2(st.x, st.y*20.)));
    pic.b  = pic.b * (1. - gnoise(vec2(st.x, st.y*60.)));

    
    vec3 color = vec3(0.);
    vec3 colorAll;
    colorAll.r = draw((st+interact)*10.,1.20*u_scale,205.416,pic.r);
    colorAll.g = draw((st+interact/2.)*5.,.90*u_scale,120.,pic.g);
    colorAll.b = draw((st+interact/10.)*2.,1.120*u_scale,5000.,1.-pic.b);
    
    vec3 colorR =(1. - smoothstep(0.,1.,colorAll.r) * vec3(0.770+u_colorAAmount/100.0,0.129+u_colorBAmount/100.0,0.386+u_colorCAmount/100.0));
    vec3 colorG =(1. - smoothstep(0.,1.,colorAll.g) * vec3(0.108+u_colorAAmount/100.0,0.770+u_colorBAmount/100.0,0.513+u_colorCAmount/100.0));
    vec3 colorB =(1. - smoothstep(0.,1.,colorAll.b) * vec3(0.078+u_colorAAmount/100.0,0.246+u_colorBAmount/100.0,0.770+u_colorCAmount/100.0));
    // vec3 colorR =(1. - smoothstep(0.,1.,colorAll.r) * vec3(0.770,0.129,0.386));
    // vec3 colorG =(1. - smoothstep(0.,1.,colorAll.g) * vec3(0.108,0.770,0.513));
    // vec3 colorB =(1. - smoothstep(0.,1.,colorAll.b) * vec3(0.078,0.246,0.770));
    color = colorR*colorG*colorB;
    // color = colorR/3. + colorG/3. + colorB/3.;
    // color =1. - smoothstep(0.,1.,(colorAll)) * vec3(0.990,0.504,0.370);

    gl_FragColor = vec4(color,1.0);
}