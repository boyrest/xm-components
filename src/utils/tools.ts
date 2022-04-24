const PRIFIX_CLS = 'xc-components';

export function getPrefixCls(suffix: string): string {
  return `${PRIFIX_CLS}-${suffix}`;
}
