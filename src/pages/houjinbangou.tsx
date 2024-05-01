import {
  KENALL,
  NTACorporateInfo,
  NTACorporateInfoSearcherOptions,
  NTACorporateInfoSearchMode,
} from '@ken-all/kenall';
import React from 'react';
import { FixedSizeList } from 'react-window';
import {
  useTable,
  useAbsoluteLayout,
  Column,
  CellProps,
  Renderer,
} from 'react-table';
import { useForm } from 'react-hook-form';
import { api } from '../kenall';
import { BrowserConfigContext } from '../context';
import CloseIcon from '@mui/icons-material/Cancel';
import FilterIcon from '@mui/icons-material/Filter';

type OptionPair = {
  value: string;
  text: string;
};

const prefectures: OptionPair[] = [
  { value: '北海道', text: '北海道' },
  { value: '青森県', text: '青森県' },
  { value: '岩手県', text: '岩手県' },
  { value: '宮城県', text: '宮城県' },
  { value: '秋田県', text: '秋田県' },
  { value: '山形県', text: '山形県' },
  { value: '福島県', text: '福島県' },
  { value: '茨城県', text: '茨城県' },
  { value: '栃木県', text: '栃木県' },
  { value: '群馬県', text: '群馬県' },
  { value: '埼玉県', text: '埼玉県' },
  { value: '千葉県', text: '千葉県' },
  { value: '東京都', text: '東京都' },
  { value: '神奈川県', text: '神奈川県' },
  { value: '新潟県', text: '新潟県' },
  { value: '富山県', text: '富山県' },
  { value: '石川県', text: '石川県' },
  { value: '福井県', text: '福井県' },
  { value: '山梨県', text: '山梨県' },
  { value: '長野県', text: '長野県' },
  { value: '岐阜県', text: '岐阜県' },
  { value: '静岡県', text: '静岡県' },
  { value: '愛知県', text: '愛知県' },
  { value: '三重県', text: '三重県' },
  { value: '滋賀県', text: '滋賀県' },
  { value: '京都府', text: '京都府' },
  { value: '大阪府', text: '大阪府' },
  { value: '兵庫県', text: '兵庫県' },
  { value: '奈良県', text: '奈良県' },
  { value: '和歌山県', text: '和歌山県' },
  { value: '鳥取県', text: '鳥取県' },
  { value: '島根県', text: '島根県' },
  { value: '岡山県', text: '岡山県' },
  { value: '広島県', text: '広島県' },
  { value: '山口県', text: '山口県' },
  { value: '徳島県', text: '徳島県' },
  { value: '香川県', text: '香川県' },
  { value: '愛媛県', text: '愛媛県' },
  { value: '高知県', text: '高知県' },
  { value: '福岡県', text: '福岡県' },
  { value: '佐賀県', text: '佐賀県' },
  { value: '長崎県', text: '長崎県' },
  { value: '熊本県', text: '熊本県' },
  { value: '大分県', text: '大分県' },
  { value: '宮崎県', text: '宮崎県' },
  { value: '鹿児島県', text: '鹿児島県' },
  { value: '沖縄県', text: '沖縄県' },
];

const kinds: OptionPair[] = [
  { value: '101', text: '行政機関など' },
  { value: '201', text: '地方公共団体' },
  { value: '301', text: '株式会社' },
  { value: '302', text: '有限会社' },
  { value: '303', text: '合名会社' },
  { value: '304', text: '合資会社' },
  { value: '305', text: '合同会社' },
  { value: '399', text: 'その他の設立登記法人' },
  { value: '401', text: '外国会社等' },
  { value: '499', text: 'その他' },
];

const modes: OptionPair[] = [
  { value: 'partial', text: '部分一致' },
  { value: 'exact', text: '完全一致' },
];

class NTACorporateInfoChunk {
  constructor(
    public offset: number,
    public length: number,
    public data: Promise<NTACorporateInfo[] | undefined>
  ) {}

  pointedBy(
    i: number
  ): [number, Promise<NTACorporateInfo | undefined> | undefined] {
    if (i < this.offset) {
      return [-1, undefined];
    } else if (i >= this.offset + this.length) {
      return [1, undefined];
    } else {
      return [0, this.data.then((data) => data && data[i - this.offset])];
    }
  }
}

class VirtualizedSearchResult {
  lru: number[] = [];
  sorted: NTACorporateInfoChunk[] = [];
  options: NTACorporateInfoSearcherOptions;
  private _count: Promise<number> | undefined = undefined;
  private cancelables = new WeakMap<
    Promise<NTACorporateInfo | undefined>,
    Promise<NTACorporateInfo | undefined>
  >();
  private canceled = false;

  constructor(
    private api: KENALL,
    options: NTACorporateInfoSearcherOptions,
    private cacheSize: number
  ) {
    this.options = {
      limit: 30,
      ...options,
    };
  }

  private purge(chunk: NTACorporateInfoChunk): boolean {
    const ci = this.sorted.findIndex((item) => item === chunk);
    if (ci < 0) {
      return false;
    }
    for (let i = 0; i < this.lru.length; ) {
      if (this.lru[i] === ci) {
        this.lru.splice(i, 1);
        continue;
      }
      if (this.lru[i] > ci) {
        --this.lru[i];
      }
      ++i;
    }
    this.sorted.splice(ci, 1);
    return true;
  }

  cancelAll() {
    this.canceled = true;
  }

  private makeCancelable(
    p: Promise<NTACorporateInfo | undefined>
  ): Promise<NTACorporateInfo | undefined> {
    let cancelable = this.cancelables.get(p);
    if (cancelable === undefined) {
      cancelable = new Promise((resolve, reject) => {
        this.cancelables.delete(p);
        if (this.canceled) {
          return undefined;
        }
        p.then(resolve, reject);
      });
      this.cancelables.set(p, cancelable);
    }
    return cancelable;
  }

  async count(): Promise<number> {
    if (this._count === undefined) {
      const respP = this.api.searchNTACorporateInfo(this.options);
      const chunk: NTACorporateInfoChunk = new NTACorporateInfoChunk(
        0,
        this.options.limit as number,
        respP.then(
          (resp) => resp.data,
          () => {
            this.purge(chunk);
            return undefined;
          }
        )
      );
      this.sorted.push(chunk);
      this.lru.push(0);
      this._count = respP.then(
        (resp) => resp.count,
        () => 0
      );
    }
    return await this._count;
  }

  async get(i: number): Promise<NTACorporateInfo | undefined> {
    if (i >= (await this.count())) {
      return undefined;
    }
    if (this.lru.length > 0) {
      const itemP = this.sorted[this.lru[0]].pointedBy(i)[1];
      if (itemP !== undefined) {
        return this.makeCancelable(itemP);
      }
    }
    {
      let s = 0,
        e = this.sorted.length,
        j = 0;
      while (s < e && s < this.sorted.length) {
        j = ((s + e) / 2) | 0;
        const chunk = this.sorted[j];
        const [d, itemP] = chunk.pointedBy(i);
        switch (d) {
          case 0:
            return itemP;
          case -1:
            e = j;
            break;
          case 1:
            ++j;
            s = j;
            break;
        }
      }
      const limit = this.options.limit as number;
      const chunkOffset = ((i / limit) | 0) * limit;
      const respP = this.api.searchNTACorporateInfo({
        ...this.options,
        offset: chunkOffset,
      });
      const chunk = new NTACorporateInfoChunk(
        chunkOffset,
        limit,
        respP.then(
          (resp) => resp.data,
          () => {
            this.purge(chunk);
            return undefined;
          }
        )
      );
      for (let i = 0; i < this.lru.length; ++i) {
        if (this.lru[i] >= j) {
          ++this.lru[i];
        }
      }
      this.lru.unshift(j);
      this.sorted.splice(j, 0, chunk);
      if (this.lru.length > this.cacheSize) {
        const ci = this.lru.pop() as number;
        for (let i = 0; i < this.lru.length; ++i) {
          if (this.lru[i] > ci) {
            --this.lru[i];
          }
        }
        this.sorted.splice(ci, 1);
      }
      {
        const itemP = chunk.pointedBy(i)[1];
        return itemP && this.makeCancelable(itemP);
      }
    }
  }
}

type SearchParams = {
  corporateName: string | undefined;
  prefecture?: string;
  kind?: string;
  mode?: NTACorporateInfoSearchMode;
};

const quote = (v: string): string => `"${v.replace(/"/g, '\\"')}"`;

const buildSearchArgs = (
  params: SearchParams
): NTACorporateInfoSearcherOptions => {
  const query: Array<string> = [];
  const corporateName =
    params.corporateName !== undefined ? params.corporateName.trim() : '';
  const quotedCorporateName = corporateName !== '' ? quote(corporateName) : '';
  if (quotedCorporateName !== '') {
    query.push(
      `(name:${quotedCorporateName} OR furigana:${quotedCorporateName})`
    );
  }
  if (params.prefecture) {
    query.push(`prefecture_name:${params.prefecture}`);
  }
  if (params.kind) {
    query.push(`_facet_kind:/${kindsMap.get(params.kind)}`);
  }
  const mode = params.mode ? params.mode : 'partial';
  return { query: query.join(' AND '), mode: mode };
};

const kindsMap = new Map<string, string>(
  kinds.map(({ value, text }) => [value, text])
);

const makeAccessor = <T extends keyof NTACorporateInfo>(
  propName: T
): ((
  recP: () => Promise<NTACorporateInfo | undefined>
) => () => Promise<NTACorporateInfo[T] | undefined>) => {
  return (recP) => () =>
    recP().then((rec) => (rec !== undefined ? rec[propName] : undefined));
};

const columns = [
  {
    Header: '法人名',
    id: 'name',
    accessor: makeAccessor('name'),
    width: 300,
    minWidth: 300,
  },
  {
    Header: '都道府県',
    id: 'prefecture_name',
    accessor: makeAccessor('prefecture_name'),
    width: 80,
    minWidth: 80,
  },
  {
    Header: '市区町村',
    id: 'city_name',
    accessor: makeAccessor('city_name'),
    width: 120,
    minWidth: 120,
  },
  {
    Header: '市区町村以下の住所',
    id: 'street_number',
    accessor: makeAccessor('street_number'),
    width: 500,
    minWidth: 500,
  },
];

const defaultColumn: Partial<Column<RowPromiseInitiator>> = {
  Cell: (({ value }: { value: () => Promise<string> }): React.ReactNode => {
    const [resolvedValue, setResolvedValue] = React.useState<
      string | undefined
    >(undefined);
    React.useEffect(() => {
      value().then((resolved) => {
        setResolvedValue(resolved);
      });
    }, [value]);
    return (
      resolvedValue || (
        <div className="inline-block align-baseline bg-gray-200 w-32 h-3"></div>
      )
    );
  }) as Renderer<CellProps<RowPromiseInitiator, any>>,
};

type ReadyState = 0 | 1;
type RowPromiseInitiator = () => Promise<NTACorporateInfo | undefined>;

const SearchResultTable: React.FunctionComponent<{
  options: NTACorporateInfoSearcherOptions;
  height: number;
  onSelect?: (rec: NTACorporateInfo) => void;
  onReadyStateChange?: (state: ReadyState) => void;
}> = ({ options, height, onSelect, onReadyStateChange }) => {
  const { scrollbarWidth } = React.useContext(BrowserConfigContext);
  const [data, setData] = React.useState<
    [number | undefined, RowPromiseInitiator[]]
  >([undefined, []]);
  const listRef = React.useRef<FixedSizeList>(null);

  // performance improvement
  const queue = React.useRef<{
    fs: string[];
    bags: Record<string, Array<() => void>>;
    t: number | undefined;
  }>({ fs: [], bags: {}, t: undefined });

  const enqueue = (discriminator: any, f: () => void) => {
    const bags = queue.current.bags;
    const d = String(discriminator);
    const bag: Array<() => void> | undefined = bags[d];
    if (bag === undefined) {
      queue.current.fs.push(d);
      bags[d] = [f];
    } else {
      bag.push(f);
    }
    if (queue.current.t !== undefined) {
      window.clearTimeout(queue.current.t);
    }
    queue.current.t = window.setTimeout(() => {
      const fs = queue.current.fs;
      const bags = queue.current.bags;
      for (let i = Math.max(fs.length - 20, 0); i < fs.length; i++) {
        bags[fs[i]].forEach((fn) => fn());
      }
      queue.current.t = undefined;
      queue.current.fs = [];
      queue.current.bags = {};
    }, 500);
  };

  React.useEffect(() => {
    let c = -1;
    const vResult = new VirtualizedSearchResult(api, options, 100);

    vResult.count().then((count) => {
      const result: RowPromiseInitiator[] = [];

      type Continuation = () => Continuation | undefined;

      let continuation: Continuation | undefined = (() => {
        const step = 10000;
        const mf = (n: number) => () => {
          const nn = Math.min(n + step, count);
          for (let i = n; i < nn; i++) {
            ((i) => {
              result.push(
                () =>
                  new Promise<NTACorporateInfo | undefined>(
                    (resolve, reject) => {
                      enqueue(i, () => {
                        vResult.get(i).then(resolve, reject);
                      });
                    }
                  )
              );
            })(i);
          }
          setData([count, result]);
          return nn < count ? mf(nn) : undefined;
        };
        return mf(0);
      })();

      continuation = continuation();
      c = window.setInterval(() => {
        if (continuation === undefined) {
          window.clearInterval(c);
        } else {
          continuation = continuation();
        }
      }, 10000);

      onReadyStateChange && onReadyStateChange(0);
    });

    if (listRef.current !== null) {
      listRef.current.scrollTo(0);
    }
    setData([undefined, []]);

    onReadyStateChange && onReadyStateChange(1);

    return () => {
      vResult.cancelAll();
      if (c >= 0) {
        window.clearInterval(c);
      }
      if (queue.current !== undefined && queue.current.t) {
        window.clearTimeout(
          queue.current.t
        ); /* eslint "react-hooks/exhaustive-deps": "off" */
        queue.current.t = undefined;
        queue.current.fs = [];
        queue.current.bags = {};
      }
    };
  }, [options]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
  } = useTable({ columns, data: data[1], defaultColumn }, useAbsoluteLayout);

  const RenderRow = React.useCallback(
    ({ index, style }: { index: number; style: any }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div
          {...row.getRowProps({
            style: {
              ...style,
              minWidth: totalColumnsWidth,
            },
          })}
          className={`modal-table-tr ${
            index % 2 ? 'modal-table-row-odd' : 'modal-table-row-even'
          }`}
          onClick={
            onSelect &&
            (() => row.original().then((rec) => rec && onSelect(rec)))
          }
        >
          {row.cells.map((cell) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <div {...cell.getCellProps()} className="modal-table-td">
                {cell.render('Cell')}
              </div>
            );
          })}
        </div>
      );
    },
    [prepareRow, rows, height, onSelect, totalColumnsWidth]
  );

  const rowContainerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useCallback((elem: HTMLDivElement) => {
    if (!elem || !elem.parentNode) return;
    const parentNode = elem.parentNode as HTMLDivElement;
    parentNode.addEventListener(
      'scroll',
      () => {
        if (rowContainerRef.current != null) {
          rowContainerRef.current.scrollLeft = parentNode.scrollLeft;
        }
      },
      false
    );
  }, []);

  return (
    <>
      <div {...getTableProps()} className="modal-table">
        <div className="modal-table-thead">
          {headerGroups.map((headerGroup, i) => (
            <div
              key={i}
              style={{ width: '100%', overflow: 'hidden' }}
              ref={rowContainerRef}
            >
              <div
                {...headerGroup.getHeaderGroupProps({
                  style: {
                    width: totalColumnsWidth + scrollbarWidth,
                  },
                })}
                className="modal-table-tr"
              >
                {headerGroup.headers.map((column) => (
                  // eslint-disable-next-line react/jsx-key
                  <div {...column.getHeaderProps()} className="modal-table-th">
                    {column.render('Header')}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          {...getTableBodyProps({
            style: {
              width: '100%',
            },
          })}
          className="modal-table-tbody"
        >
          <FixedSizeList
            height={height - 64}
            itemCount={rows.length}
            itemSize={32}
            width="100%"
            innerRef={innerRef}
            ref={listRef}
          >
            {RenderRow}
          </FixedSizeList>
        </div>

        <div className="modal-table-footer">
          {data[0] !== undefined ? `${data[0]}件見つかりました` : ''}
        </div>
      </div>
    </>
  );
};

const Modal: React.FunctionComponent<{
  showFlag: boolean | undefined;
  defaultParams: SearchParams | undefined;
  onCloseButtonClick?: React.MouseEventHandler;
  onSelect?: (rec: NTACorporateInfo) => void;
}> = ({ showFlag, defaultParams, onCloseButtonClick, onSelect }) => {
  const [options, setOptions] = React.useState<
    NTACorporateInfoSearcherOptions | undefined
  >();
  const onSubmit = (d: SearchParams) => {
    setOptions(buildSearchArgs(d));
  };
  const [disabled, setDisabled] = React.useState<boolean>(false);
  const onReadyStateChange = (state: ReadyState) => {
    switch (state) {
      case 0:
        setDisabled(false);
        break;
      case 1:
        setDisabled(true);
    }
  };

  const { register, handleSubmit, reset } = useForm<SearchParams>();

  const Select: React.FunctionComponent<
    {
      options: { value: string; text: string }[];
      placeholder?: string;
      className?: string;
    } & React.RefAttributes<HTMLSelectElement> &
      React.SelectHTMLAttributes<HTMLSelectElement>
  > = React.forwardRef(
    ({ options, placeholder, className, ...params }, ref) => {
      return (
        <select
          className={`border-0 rounded-md text-gray-600 pl-2 pr-8 text-sm ${className}`}
          ref={ref}
          {...params}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(({ value, text }, i) => (
            <option value={value} key={i}>
              {text}
            </option>
          ))}
        </select>
      );
    }
  );

  const [searchResultTableHeight, setSearchResultTableHeight] =
    React.useState<number>(48);

  const outerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (showFlag && outerRef.current !== null) {
      const elem = outerRef.current;
      const doSetHeight = () => {
        const outerElemBounds = elem.getBoundingClientRect();
        setSearchResultTableHeight(outerElemBounds.height);
      };
      const ob = new ResizeObserver(doSetHeight);
      ob.observe(outerRef.current);
      doSetHeight();

      if (defaultParams !== undefined) {
        reset(defaultParams);
      }
    }
    setOptions(undefined);
  }, [showFlag]);

  return (
    <div
      className={`fixed top-12 md:top-0 left-0 right-0 bottom-12 md:bottom-0 flex align-center justify-center ${
        !showFlag && 'hidden'
      }`}
    >
      <style jsx>{`
        button.bg-gray-300:disabled {
          @apply bg-gray-400;
        }
      `}</style>
      <div className="bg-gray-500 bg-opacity-75 rounded-md w-full md:w-5/6 lg:w-3/4 md:h-1/2 h-full m-4 md:m-auto p-4 relative">
        <div className="absolute right-0 -top-5">
          <button onClick={onCloseButtonClick}>
            <CloseIcon sx={{ width: '1.5rem', height: '1.5rem' }} />
          </button>
        </div>
        <div className="flex flex-col w-full h-full">
          <form
            className="flex flex-col w-full sm:w-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col">
              <div>
                <input
                  className="border-0 rounded-md px-2 leading-8 form-input-text w-full"
                  type="text"
                  placeholder="法人名で検索(例: オープンコレクター)"
                  disabled={disabled}
                  {...register('corporateName')}
                ></input>
              </div>
              <div className="flex flex-row flex-wrap -mr-1">
                <div className="mt-1 mr-1">
                  <Select
                    options={prefectures}
                    placeholder="(全都道府県)"
                    disabled={disabled}
                    {...register('prefecture')}
                  />
                </div>
                <div className="mt-1 mr-1 flex-auto">
                  <Select
                    options={kinds}
                    placeholder="(全種別)"
                    disabled={disabled}
                    className="w-full"
                    {...register('kind')}
                  />
                </div>
                <div className="mt-1 mr-1 flex-auto">
                  <Select
                    options={modes}
                    disabled={disabled}
                    className="w-full"
                    {...register('mode')}
                  />
                </div>
                <div className="mt-1 mr-1 flex-auto basis-full">
                  <button
                    type="submit"
                    className="rounded-md bg-gray-300 p-2 w-full whitespace-nowrap text-sm"
                    disabled={disabled}
                  >
                    検索
                  </button>
                </div>
              </div>
            </div>
          </form>
          <div className="flex-1 mt-1 overflow-hidden" ref={outerRef}>
            {options && showFlag && (
              <SearchResultTable
                options={options}
                height={searchResultTableHeight}
                onSelect={onSelect}
                onReadyStateChange={onReadyStateChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TextField: React.FunctionComponent<
  {
    label: string;
    elemClassName?: string;
  } & React.RefAttributes<HTMLInputElement> &
    React.InputHTMLAttributes<HTMLInputElement>
> = React.forwardRef(
  ({ children, label, name, elemClassName, ...params }, ref) => {
    const id = `form-${name}`;
    return (
      <>
        <label className="form-label" htmlFor={id}>
          <span className="form-label-main">{label}</span>
        </label>
        <div className="form-field-main">
          <input
            key={name}
            id={id}
            type="text"
            className={`form-field-elem ${elemClassName}`}
            name={name}
            ref={ref}
            {...params}
          />
          {children}
        </div>
      </>
    );
  }
);

const SelectField: React.FunctionComponent<
  {
    label: string;
    placeholder?: string;
    elemClassName?: string;
    options: OptionPair[];
  } & React.RefAttributes<HTMLSelectElement> &
    React.SelectHTMLAttributes<HTMLSelectElement>
> = React.forwardRef(
  ({ label, name, placeholder, elemClassName, options, ...params }, ref) => {
    const id = `form-${name}`;
    return (
      <>
        <label className="form-label" htmlFor={id}>
          <span className="form-label-main">{label}</span>
        </label>
        <div className="form-field-main">
          <select
            key={name}
            id={id}
            className={`form-field-elem ${elemClassName}`}
            name={name}
            ref={ref}
            {...params}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(({ value, text }, i) => (
              <option value={value} key={i}>
                {text}
              </option>
            ))}
          </select>
        </div>
      </>
    );
  }
);

type HoujinbangouForm = {
  corporateName: string;
  corporateNumber: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address1: string;
  address2: string;
};

const Houjinbangou: React.FunctionComponent = () => {
  const { register, getValues, setValue } = useForm<HoujinbangouForm>();
  const [searchParams, setSearchParams] = React.useState<
    SearchParams | undefined
  >(undefined);
  const [showModalFlag, setShowModalFlag] = React.useState<boolean | undefined>(
    undefined
  );
  const onOpenModalButtonClick: React.MouseEventHandler = (e) => {
    e.preventDefault();
    const values = getValues();
    setSearchParams({
      corporateName: values.corporateName,
      prefecture: values.prefecture,
    });
    setShowModalFlag(true);
  };

  const onCorporateSelect = (rec: NTACorporateInfo) => {
    setShowModalFlag(false);
    setValue('corporateName', rec.name);
    setValue('corporateNumber', rec.corporate_number);
    setValue('postalCode', rec.post_code || '');
    setValue('prefecture', rec.prefecture_name || '');
    setValue('city', rec.city_name || '');
    setValue('address1', rec.town ? rec.town + (rec.block_lot_num || '') : '');
    setValue(
      'address2',
      (rec.building ? rec.building + ' ' : '') + (rec.floor_room || '')
    );
  };

  return (
    <>
      <style jsx global>{`
        .form-field-main {
          @apply md:mb-0 mb-3 flex flex-row items-center;
        }

        .form-field-elem {
          @apply border-gray-300 rounded-md;
        }

        .form-label {
          @apply md:mt-2;
        }

        .form-label.nogap {
          @apply md:mt-0;
        }

        .form-label-main {
          display: block;
        }

        .form-label-main.required::after {
          @apply text-gray-500 text-xs;
          content: '*';
          vertical-align: super;
        }

        .form-label-aux {
          display: block;
          @apply text-sm;
        }

        @media (min-width: 768px) {
          .md-form-field-horiz {
            grid-template-columns: minmax(8rem, 10rem) minmax(20rem, 1fr);
          }
        }

        .modal-table-tr {
          height: 32px;
        }

        .modal-table-thead {
          height: 32px;
          @apply bg-white border-b border-gray-300;
        }

        .modal-table-footer {
          height: 32px;
        }

        .modal-table-td,
        .modal-table-th {
          @apply overflow-hidden whitespace-nowrap p-1;
        }

        .modal-table-tbody {
          @apply bg-white;
        }

        .modal-table-tbody .modal-table-tr:hover {
          @apply bg-gray-200 cursor-pointer;
        }

        .modal-table-tbody .modal-table-tr:active {
          @apply bg-gray-400;
        }

        .modal-table-tbody .modal-table-row-odd {
          @apply bg-gray-100;
        }
      `}</style>
      <div className="flex flex-col">
        <h1 className="mb-5 text-3xl font-bold text-gray-500">
          法人番号API デモ: 法人住所入力フォーム
        </h1>

        <div className="my-2 flex flex-col w-full">
          <form>
            <div className="grid gap-2 md-form-field-horiz grid-cols-1">
              <TextField
                label="法人名"
                placeholder="法人名"
                {...register('corporateName')}
                elemClassName="w-full sm:w-1/2"
              >
                <button
                  className="ml-2 rounded-md p-2 h-8 w-26 bg-gray-300 text-sm whitespace-nowrap flex flex-cols justify-center items-center"
                  onClick={onOpenModalButtonClick}
                >
                  <span>簡単入力</span>
                  <FilterIcon
                    fontSize="small"
                    viewBox="0 0 30 30"
                    sx={{ marginLeft: '4px' }}
                  />
                </button>
              </TextField>
              <TextField
                label="法人番号"
                placeholder="法人番号"
                {...register('corporateNumber')}
                minLength={13}
                maxLength={14}
                pattern="\d*"
                elemClassName="w-40"
              />
              <TextField
                label="郵便番号"
                placeholder="郵便番号"
                {...register('postalCode')}
                minLength={7}
                maxLength={8}
                pattern="\d*"
                elemClassName="w-28"
              />
              <SelectField
                label="都道府県"
                placeholder="(都道府県)"
                {...register('prefecture')}
                elemClassName="w-32"
                options={prefectures}
              />
              <TextField
                label="市区町村"
                placeholder="市区町村"
                {...register('city')}
                elemClassName="w-36"
              />
              <TextField
                label="町名・番地"
                placeholder="町名・番地"
                {...register('address1')}
                elemClassName="w-full sm:w-1/2"
              />
              <TextField
                label="建物名など"
                placeholder="建物名など"
                {...register('address2')}
                elemClassName="w-full sm:w-1/2"
              />
            </div>
          </form>
        </div>

        <Modal
          showFlag={showModalFlag}
          onCloseButtonClick={() => setShowModalFlag(false)}
          onSelect={onCorporateSelect}
          defaultParams={searchParams}
        />
      </div>
    </>
  );
};

export default Houjinbangou;
