const PRIFIX_CLS = 'xm-components';

export function getPrefixCls(suffix: string): string {
  return `${PRIFIX_CLS}-${suffix}`;
}
