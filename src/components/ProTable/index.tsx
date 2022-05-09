import React, { useState, useEffect, useRef, useImperativeHandle, ReactNode } from 'react';
import Filter, { FilterRef, IFilterProps } from './Filter';
import { Table } from 'antd';
import { SorterResult, TableProps } from 'antd/lib/table/interface';
import isEqual from 'lodash/isEqual';
import { PaginationConfig } from 'antd/lib/pagination/Pagination';
import './index.less';
import { WrappedFormUtils } from 'antd/lib/form/Form';

export type RequestResult<T> = {
  total: number;
  data: T[];
};

export type PaginationType = {
  current: number;
  pageSize: number;
};

export type ActionType = {
  delRefresh: () => void;
  addRefresh: () => void;
  refresh: (pageInfo?: PaginationType) => void;
  searchWithFilters: (value: Record<string, unknown> | null) => void;
  getFilterHandle: () => WrappedFormUtils | null;
  getPageInfo: () => PaginationType;
};

export type IProTable<T> = {
  filterProps?: Omit<IFilterProps<Record<string, unknown>>, 'loading'>;
  tableProps: TableProps<T> & { paginationDisplayCount?: number | boolean };
  request: (
    searchFilters: Record<string, unknown> | null,
    sorter: SorterResult<T> | {},
    pagination: PaginationType,
    tableFilter: Partial<Record<keyof T, string[]>>,
  ) => Promise<RequestResult<T>>;
  onError: (e: unknown) => void;
  actionRef?: React.Ref<ActionType | undefined>;
  children?: ReactNode | undefined;
};

const ProTable = <T extends Record<string, any>>(props: IProTable<T>) => {
  const { filterProps, tableProps, onError, request, children, actionRef: propsActionRef } = props;
  const { paginationDisplayCount = 10, pagination = {} } = tableProps;
  const paginationSetting = pagination;
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(
    (paginationSetting ? paginationSetting.current : false) || 1,
  );
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(
    (paginationSetting ? paginationSetting.pageSize : false) || 10,
  );
  const tableFiltersRef = useRef<Partial<Record<keyof T, string[]>>>({});
  const sorterRef = useRef<SorterResult<T> | {}>({});
  const filtersRef = useRef<Record<string, unknown> | null>(null);
  const [list, setList] = useState<T[]>([]);
  const filterRef = useRef<FilterRef | null>(null);

  async function getData(current: number, pageSize: number) {
    setLoading(true);
    try {
      const result = await request(
        filtersRef.current,
        sorterRef.current,
        { current, pageSize },
        tableFiltersRef.current,
      );
      setTotal(result.total);
      setList(result.data);
    } catch (e: unknown) {
      onError(e);
    } finally {
      setLoading(false);
    }
  }
  const _actionRef = useRef<ActionType>();
  useImperativeHandle(propsActionRef, () => _actionRef.current);

  _actionRef.current = {
    delRefresh: () => {
      if (current === 1) {
        getData(current, pageSize);
      } else {
        const preCount = (current - 1) * pageSize;
        if (preCount + 1 === total) {
          getData(current - 1, pageSize);
          setCurrent(current - 1);
        } else {
          getData(current, pageSize);
        }
      }
    },
    refresh: (pageInfo) => {
      if (pageInfo?.current) {
        setCurrent(pageInfo.current);
      }
      if (pageInfo?.pageSize) {
        setPageSize(pageInfo.pageSize);
      }
      getData(pageInfo?.current || current, pageInfo?.pageSize || pageSize);
    },
    addRefresh: () => {
      if (current !== 1) {
        getData(1, pageSize);
        setCurrent(1);
      } else {
        getData(current, pageSize);
      }
    },
    searchWithFilters: (value: Record<string, unknown> | null) => {
      filtersRef.current = value || {};
      setCurrent(1);
      getData(1, pageSize);
    },
    getFilterHandle: () => {
      return filterRef.current?.getFilterHandle() || null;
    },
    getPageInfo: () => {
      return { current, pageSize };
    },
  };

  if (propsActionRef) {
    // @ts-ignore
    propsActionRef.current = _actionRef.current;
  }

  useEffect(() => {
    setTimeout(() => {
      filtersRef.current = filterRef.current?.getFilterHandle()?.getFieldsValue() || null;
      getData(current, pageSize);
    }, 10);
  }, []);

  function onChange(
    pagination: PaginationConfig,
    newFilters: Partial<Record<keyof T, string[]>>,
    newSorter: SorterResult<T>,
  ) {
    if (paginationDisplayCount === false || total > paginationDisplayCount) {
      pagination.current && setCurrent(pagination.current);
      pagination.pageSize && setPageSize(pagination.pageSize);
    }
    const isFilterChange =
      !isEqual(newFilters, tableFiltersRef.current) || !isEqual(newSorter, sorterRef.current);
    if (isFilterChange) {
      setCurrent(1);
    }
    if (!isEqual(newFilters, tableFiltersRef.current)) {
      tableFiltersRef.current = newFilters;
    }
    if (!isEqual(newSorter, sorterRef.current)) {
      sorterRef.current = newSorter;
    }
    const currentValue = isFilterChange ? 1 : pagination?.current || current;
    const currentPageSize = pagination?.pageSize || pageSize;
    getData(currentValue, currentPageSize);
  }

  function onSearch(newFilters: Record<string, unknown>) {
    filtersRef.current = newFilters;
    setCurrent(1);
    getData(1, pageSize);
  }

  function onReset(value: Record<string, unknown> | null) {
    filtersRef.current = value;
    setCurrent(1);
    getData(1, pageSize);
  }

  const paginationConfig: PaginationConfig | false =
    paginationDisplayCount === false || total > paginationDisplayCount
      ? {
          ...(tableProps?.pagination || null),
          showQuickJumper: true,
          showSizeChanger: true,
          current,
          total,
          pageSize,
        }
      : false;

  return (
    <div>
      {filterProps && filterProps.layoutData && filterProps.layoutData.length > 0 ? (
        <Filter
          {...filterProps}
          loading={loading}
          onSearch={onSearch}
          onReset={onReset}
          wrappedComponentRef={filterRef}
        />
      ) : null}
      {children}
      <Table<T>
        {...tableProps}
        pagination={paginationConfig}
        onChange={onChange}
        dataSource={list}
        loading={loading}
      />
    </div>
  );
};

export default ProTable;
