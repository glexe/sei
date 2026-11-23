// oxlint plugin: JavaScript never styles the page, it only hands CSS data through custom properties (AGENTS.md).
const MESSAGE =
  'style may only pass data as custom properties, like {{ "--row": row }}; put the styling in CSS';

const isUndefined = (node) => node.type === 'Identifier' && node.name === 'undefined';

const isData = (node) => {
  if (node.type === 'ConditionalExpression')
    return isData(node.consequent) && isData(node.alternate);
  if (node.type !== 'ObjectExpression') return isUndefined(node);
  return node.properties.every(
    (p) =>
      p.type === 'Property' && p.key.type === 'Literal' && String(p.key.value).startsWith('--'),
  );
};

const FORBIDDEN_CALLS = new Set(['setProperty', 'insertRule', 'animate']);

const styleDataOnly = {
  create(context) {
    const report = (node) => context.report({ node, message: MESSAGE });
    return {
      JSXAttribute(node) {
        if (node.name.name !== 'style') return;
        const value = node.value?.type === 'JSXExpressionContainer' && node.value.expression;
        if (!value || !isData(value)) report(node);
      },
      MemberExpression(node) {
        if (!node.computed && node.property.name === 'style') report(node);
      },
      CallExpression(node) {
        const { callee } = node;
        if (callee.type === 'MemberExpression' && FORBIDDEN_CALLS.has(callee.property.name))
          report(node);
      },
    };
  },
};

export default { meta: { name: 'sei' }, rules: { 'style-data-only': styleDataOnly } };
