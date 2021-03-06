import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import AntdFormRender from '../AntdFormRender';
import { Form, Button } from 'antd';
import { FormComponentProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { FormRenderProps, Item } from '../AntdFormRender/Types';
import { getPrefixCls } from '../../utils/tools';
import './Filter.less';

export type IFilterProps<T> = {
  /** 查询按钮文案 */
  SearchButtonText?: string;
  /** 重置按钮文案 */
  ResetButtonText?: string;
  /** 使用默认查询按钮 */
  defaultButtons?: boolean;
  /** 查询点击后回调事件 */
  onSearch: (filters: Record<string, unknown>) => void;
  /** 查询点击后回调事件 */
  onReset: (filters: Record<string, unknown> | null) => void;
  /** 是否在查询 */
  loading: boolean;
  /** prefix class name*/
  prefixClass?: string;
} & FormRenderProps<T>;

export type FilterRef = {
  getFilterHandle: () => WrappedFormUtils;
};

const Filter = forwardRef<
  FilterRef,
  IFilterProps<Record<string, unknown>> & FormComponentProps<Record<string, unknown>>
>((props, ref) => {
  const {
    form,
    SearchButtonText = '查询',
    ResetButtonText = '重置',
    defaultButtons = true,
    layoutData,
    cols,
    formData,
    onSearch,
    onReset,
    loading,
    layoutType,
    prefixClass = getPrefixCls('pro-table-filter'),
  } = props;
  const [filterData, setFilterData] = useState([]);
  useImperativeHandle(ref, () => {
    return {
      getFilterHandle: () => {
        return form;
      },
    };
  });
  useEffect(() => {
    if (defaultButtons) {
      const buttons: Item = {
        render() {
          return (
            <div className={`${prefixClass}-actions`}>
              <Button
                type="primary"
                onClick={() => {
                  onSearch && onSearch(form.getFieldsValue());
                }}
                className={`${prefixClass}-submit`}
                loading={loading}
              >
                {SearchButtonText}
              </Button>
              <Button
                onClick={() => {
                  if (!loading) {
                    form.resetFields();
                    onReset && onReset(form.getFieldsValue());
                  }
                }}
                className={`${prefixClass}-reset`}
                style={{
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {ResetButtonText}
              </Button>
            </div>
          );
        },
      };
      // @ts-ignore
      setFilterData([...layoutData, buttons]);
    } else {
      // @ts-ignore
      setFilterData([...layoutData]);
    }
  }, [layoutData, defaultButtons, loading, onSearch, onReset]);

  return (
    <AntdFormRender
      form={form}
      layoutData={filterData}
      formData={{
        ...formData,
      }}
      cols={cols}
      layoutType={layoutType}
    />
  );
});

export default Form.create<IFilterProps<Record<string, unknown>> & FormComponentProps>()(Filter);
