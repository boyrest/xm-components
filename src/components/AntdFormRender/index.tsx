import React from 'react';
import { Row, Form } from 'antd';
import { FormRenderProps, Item } from './Types';
import ItemRender from './ItemRender';
import { FormComponentProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { getPrefixCls } from '../../utils/tools';

const isType = (type: string) => (n: unknown) => {
  return Object.prototype.toString.call(n) === `[object ${type}]`;
};

const isNumber = isType('Number');

const renderTowDimensionLayout = ({
  layoutData,
  form,
}: { layoutData: Item[] | Item[][] } & FormComponentProps) => {
  return (
    <div className={getPrefixCls('antd-form-render')}>
      {layoutData.map((arr, idx) => {
        if (Array.isArray(arr)) {
          const len = arr.length;
          if (24 % len !== 0) {
            throw new Error('数组的长度必须能被24整除');
          }
          const span = 24 / len;

          return (
            <Row key={idx} gutter={{ xs: 8, sm: 16, md: 24 }}>
              {arr.map((item, subIndex) => (
                <ItemRender item={item} key={subIndex} span={span} layoutType="row" form={form} />
              ))}
            </Row>
          );
        } else {
          throw new Error('传参不是数组');
        }
      })}
    </div>
  );
};

const FormRenderer = <T extends Record<string, unknown>>({
  layoutData,
  cols = 1,
  formData = {},
  form,
  layoutType = 'default',
}: FormRenderProps<T>) => {
  let isOneDimensionArray = false;

  // @ts-ignore
  layoutData = layoutData.filter((item) => {
    if (Array.isArray(item)) {
      return item.map((itemInner) => {
        if (itemInner.visible) {
          return itemInner.visible();
        }
        return true;
      });
    } else {
      if (item.visible) {
        return item.visible();
      }
      return true;
    }
  });

  const firstItem = layoutData[0];
  if (!Array.isArray(firstItem)) {
    isOneDimensionArray = true;
  }
  const useAutoLayout = isOneDimensionArray && isNumber(cols) && cols > 1 && cols <= 4;

  if (useAutoLayout) {
    const arr = layoutData as Item[];
    const _tLayout = [];
    do {
      if (arr.length >= cols) {
        _tLayout.push(arr.slice(0, cols));
        arr.splice(0, cols);
      } else {
        let left = cols - arr.length;
        while (left--) {
          arr.push({
            render(): React.ReactElement {
              return <React.Fragment></React.Fragment>;
            },
          });
        }
        _tLayout.push(arr.slice(0, cols));
        arr.length = 0;
      }
    } while (arr.length);
    return <Form {...formData}>{renderTowDimensionLayout({ layoutData: _tLayout, form })}</Form>;
  }

  return (
    <Form {...formData}>
      {!isOneDimensionArray ? (
        renderTowDimensionLayout({ layoutData, form })
      ) : (
        <div className={getPrefixCls('antd-form-render')}>
          {layoutType === 'normal' ? (
            (layoutData as Item[]).map((item, idx) => (
              <ItemRender item={item} key={idx} span={24} layoutType="default" form={form} />
            ))
          ) : (
            <Row>
              {(layoutData as Item[]).map((item, idx) => (
                <ItemRender item={item} key={idx} span={24} layoutType="row" form={form} />
              ))}
            </Row>
          )}
        </div>
      )}
    </Form>
  );
};

export default FormRenderer;
