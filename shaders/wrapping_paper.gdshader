shader_type spatial;
render_mode blend_mix, cull_back, depth_draw_opaque;

// Wrapping paper factory shader.
// One shader, infinite looks via uniforms.
// pattern_type: 0=solid, 1=stripes, 2=polka dots, 3=plaid, 4=stars, 5=snowflakes

uniform vec4 base_color : source_color = vec4(0.84, 0.21, 0.35, 1.0);
uniform vec4 pattern_color : source_color = vec4(1.0, 0.84, 0.0, 1.0);
uniform int pattern_type : hint_range(0, 5) = 1;
uniform float pattern_scale : hint_range(1.0, 20.0) = 4.0;
uniform float metallic : hint_range(0.0, 1.0) = 0.15;
uniform float roughness : hint_range(0.0, 1.0) = 0.55;

float stripe_pattern(vec2 uv, float scale) {
	return step(0.5, fract(uv.x * scale));
}

float dot_pattern(vec2 uv, float scale) {
	vec2 grid = fract(uv * scale) - 0.5;
	return 1.0 - step(0.18, length(grid));
}

float plaid_pattern(vec2 uv, float scale) {
	float h = step(0.4, fract(uv.x * scale)) * (1.0 - step(0.6, fract(uv.x * scale)));
	float v = step(0.4, fract(uv.y * scale)) * (1.0 - step(0.6, fract(uv.y * scale)));
	return max(h, v);
}

float star_pattern(vec2 uv, float scale) {
	vec2 cell = fract(uv * scale) - 0.5;
	float angle = atan(cell.y, cell.x);
	float radius = length(cell);
	float star = 0.12 + 0.06 * cos(angle * 5.0);
	return 1.0 - step(star, radius);
}

float snowflake_pattern(vec2 uv, float scale) {
	vec2 cell = fract(uv * scale) - 0.5;
	float radius = length(cell);
	float angle = atan(cell.y, cell.x);
	float arms = abs(cos(angle * 3.0));
	float core = 1.0 - step(0.06, radius);
	float spokes = (1.0 - step(0.015, abs(radius * sin(angle * 3.0)))) * step(radius, 0.2);
	float tips = (1.0 - step(0.025, abs(radius - 0.18))) * step(0.7, arms);
	return max(core, max(spokes, tips));
}

void fragment() {
	vec2 uv = UV;
	float pattern = 0.0;

	if (pattern_type == 1) {
		pattern = stripe_pattern(uv, pattern_scale);
	} else if (pattern_type == 2) {
		pattern = dot_pattern(uv, pattern_scale);
	} else if (pattern_type == 3) {
		pattern = plaid_pattern(uv, pattern_scale);
	} else if (pattern_type == 4) {
		pattern = star_pattern(uv, pattern_scale);
	} else if (pattern_type == 5) {
		pattern = snowflake_pattern(uv, pattern_scale);
	}

	vec3 color = mix(base_color.rgb, pattern_color.rgb, pattern);

	// Subtle paper texture — noise-like variation
	float paper = fract(sin(dot(uv * 48.0, vec2(12.9898, 78.233))) * 43758.5453);
	color += (paper - 0.5) * 0.03;

	ALBEDO = color;
	METALLIC = metallic;
	ROUGHNESS = roughness;

	// Subtle sheen on metallic paper
	if (metallic > 0.3) {
		EMISSION = color * 0.08 * metallic;
	}
}
