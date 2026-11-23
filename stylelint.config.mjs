// Bans CSS that is expensive for the TV GPU (measured: blurs drop the grid from 60 to 16 fps).
const CHEAP = '(opacity|transform|visibility)';
const cheapList = new RegExp(`^\\s*${CHEAP}\\b[^,]*(,\\s*${CHEAP}\\b[^,]*)*$`);

const CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;

export default {
  rules: {
    'selector-class-pattern': [CAMEL_CASE, { message: (c) => `Class "${c}" must be camelCase` }],
    'keyframes-name-pattern': [
      CAMEL_CASE,
      { message: (k) => `Keyframes "${k}" must be camelCase` },
    ],
    'property-disallowed-list': [
      [
        'filter',
        'backdrop-filter',
        '-webkit-backdrop-filter',
        'mask',
        'mask-image',
        '-webkit-mask',
        '-webkit-mask-image',
        'clip-path',
        'mix-blend-mode',
        'background-blend-mode',
        '-webkit-box-reflect',
      ],
      { message: (p) => `"${p}" is too expensive for the TV GPU (see AGENTS.md)` },
    ],
    'declaration-property-value-allowed-list': [
      {
        transition: [cheapList],
        'transition-property': [cheapList],
        'will-change': ['transform', 'opacity'],
        // Layers of the screen come from tokens; -1 to 2 order things inside a component.
        'z-index': ['-1', '0', '1', '2', /^var\(--z-/],
      },
      {
        message: (p, v) =>
          p === 'z-index'
            ? `"z-index: ${v}": use a --z-* token (styles/variables.css)`
            : `"${p}: ${v}": animate only opacity, transform or visibility (see AGENTS.md)`,
      },
    ],
    'declaration-property-unit-disallowed-list': [
      {
        'font-size': ['px'],
        '/^(padding|margin)/': ['px'],
        '/^(row-|column-)?gap$/': ['px'],
        '/^border-.*radius$/': ['px'],
      },
      { message: (p) => `"${p}": use a token (styles/variables.css) instead of px` },
    ],
    'declaration-property-value-disallowed-list': [
      { '/^(color|background|background-color|border-color)$/': [/^(#|rgb|hsl)/] },
      { message: (p, v) => `"${p}: ${v}": use a color token (styles/variables.css)` },
    ],
  },
};
