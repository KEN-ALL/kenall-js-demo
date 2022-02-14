import React from 'react';
import { useForm } from 'react-hook-form';
import { KENALL, Address } from '@ken-all/kenall';

type Candidates = {
  data: Address[];
};

type AddressForm = {
  postal: string;
  prefecture: string;
  city: string;
  address1: string;
  address2: string;
};

const SENTINEL: Candidates = {
  data: [],
};

const apiBaseUrl =
  process.env.REACT_APP_KENALL_API_BASE_URL || 'https://api.kenall.jp/v1';

const api = new KENALL(process.env.REACT_APP_KENALL_API_KEY as string, {
  apibase: apiBaseUrl,
  timeout: 10000,
});

const canonicalizePostalCode = (postalCode: string): string =>
  postalCode
    .replace(/-/g, '')
    .replace(/[０１２３４５６７８９]/g, (c) =>
      String.fromCharCode(
        '0'.charCodeAt(0) + (c.charCodeAt(0) - '０'.charCodeAt(0))
      )
    );

const getAddresses = (() => {
  const cache: { [k: string]: Candidates } = {};
  return async (
    postalCode: string | undefined
  ): Promise<[string, Candidates]> => {
    if (postalCode === undefined) {
      return ['', SENTINEL];
    }
    const k = canonicalizePostalCode(postalCode);
    if (k.length < 7) {
      return [postalCode, SENTINEL];
    }
    let candidates: Candidates | undefined = cache[k];
    if (candidates === undefined) {
      candidates = await api.getAddress(k);
      cache[k] = candidates;
    }
    return [k, candidates || SENTINEL];
  };
})();

const countVariations = <T extends unknown>(
  items: Iterable<T>,
  callback: (item: T) => any
): number => {
  const c: Record<any, number> = {};
  let variations = 0;
  for (const item of items) {
    const k = callback(item);
    if (c[k] === undefined) {
      variations++;
      c[k] = 1;
    } else {
      c[k]++;
    }
  }
  return variations;
};

const buildAddressLines = (addresses: Address[]): [string, string] => {
  // 候補なしの場合
  if (addresses.length === 0) {
    return ['', ''];
  } else if (addresses.length === 1) {
    const address = addresses[0];
    // 個別事業所番号
    if (address.corporation) {
      return [address.corporation.block_lot, address.building + address.floor];
    } else {
      // 住所の要素を組み立てる
      const elements: string[] = [];
      if (address.kyoto_street) {
        elements.push(address.kyoto_street);
      }
      elements.push(address.town);
      if (address.koaza) {
        elements.push(address.koaza);
      }
      return [elements.join(' '), addresses[0].building + addresses[0].floor];
    }
  } else {
    // 都道府県や市区町村のバリエーションが複数ある場合は
    // 補完しても意味がないので補完は行わない
    if (
      countVariations(addresses, (address) => address.prefecture) > 1 ||
      countVariations(addresses, (address) => address.city) > 1
    ) {
      return ['', ''];
    }

    // 町域が複数ある場合も補完しない
    const nTowns = countVariations(addresses, (address) => address.town);
    if (nTowns > 1) {
      return ['', ''];
    }

    // 住所の要素を組み立てる
    const elements: string[] = [];

    const nKoazas = countVariations(addresses, (address) => address.koaza);
    if (nKoazas === 1) {
      const nKyotoStreets = countVariations(
        addresses.filter((address) => Boolean(address.kyoto_street)),
        (address) => address.kyoto_street
      );
      if (nKyotoStreets === 1) {
        elements.push(addresses[0].kyoto_street || '');
      }
      elements.push(addresses[0].town);
      elements.push(addresses[0].koaza);
    } else {
      elements.push(addresses[0].town);
    }

    return [elements.join(' '), ''];
  }
};

const Indicator: React.FunctionComponent<{
  className?: string | undefined;
}> = ({ className }) => {
  return (
    <div
      className={`overflow-hidden w-0 h-0 rounded-lg p-1 bg-red-400 animate-ping ${className}`}
    ></div>
  );
};

const Form: React.FunctionComponent = () => {
  const timerRef = React.useRef<number | undefined>(undefined);
  const { getValues, setValue, register, watch, reset, handleSubmit } =
    useForm<AddressForm>();
  const [timerRunning, setTimerRunning] = React.useState<boolean>(false);

  const onSubmit = (data: AddressForm) => {
    console.log(data);
  };

  const watchFields = watch([
    'postal',
    'prefecture',
    'city',
    'address1',
    'address2',
  ]);

  React.useEffect(() => {
    // タイマーがすでに動いていればキャンセルする
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
      setTimerRunning(false);
    }
    // すでに入力済みであれば何もしない
    const [postalCode, prefecture, city, address1, address2] = watchFields;
    if (prefecture || city || address1 || address2) {
      return;
    }
    getAddresses(postalCode).then(([canonical, candidates]) => {
      // 整形済みの値をセットする
      setValue('postal', canonical);
      // Promiseの後なので、watchFieldsの値は古くなっている可能性があるから
      // 再度チェックする
      {
        const [prefecture, city, address1, address2] = getValues([
          'prefecture',
          'city',
          'address1',
          'address2',
        ]);
        if (prefecture || city || address1 || address2) {
          return;
        }
      }
      // 候補がない場合にも補完は実行しない
      if (candidates.data.length === 0) {
        return;
      }
      // ブラウザのautocompleteを邪魔しないように2秒後に補完を発動する
      timerRef.current = window.setTimeout(() => {
        setTimerRunning(false);
        // 再度バリデーション
        {
          const [prefecture, city, address1, address2] = getValues([
            'prefecture',
            'city',
            'address1',
            'address2',
          ]);
          if (prefecture || city || address1 || address2) {
            return;
          }
        }
        const candidate = candidates.data[0];
        setValue('prefecture', candidate.jisx0402.substring(0, 2));
        setValue('city', candidate.city);
        const [address1, address2] = buildAddressLines(candidates.data);
        setValue('address1', address1);
        setValue('address2', address2);
      }, 2000);
      setTimerRunning(true);
    });
    return () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, watchFields); /* eslint "react-hooks/exhaustive-deps": "off" */

  return (
    <>
      <style jsx>{`
        .form-field-main {
          @apply md:mb-0 mb-3;
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
      `}</style>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2 md-form-field-horiz grid-cols-1">
          <label htmlFor="form-postal" className="form-label">
            <span className="form-label-main required">郵便番号</span>
          </label>
          <div className="form-field-main">
            <input
              id="form-postal"
              type="text"
              minLength={7}
              maxLength={8}
              pattern="\d*"
              autoComplete="shipping postal-code"
              placeholder="郵便番号"
              className="form-field-elem w-28"
              {...register('postal', {
                required: '郵便番号を入力してください',
              })}
            />
          </div>

          <label htmlFor="form-prefecture" className="form-label">
            <span className="form-label-main required">都道府県</span>
          </label>
          <div className="form-field-main">
            <div className="relative inline-block">
              <select
                id="form-prefecture"
                autoComplete="shipping address-level1"
                className="form-field-elem w-28"
                {...register('prefecture', {
                  required: '都道府県を入力してください',
                })}
              >
                <option value="">(選択)</option>
                <option value="01">北海道</option>
                <option value="02">青森県</option>
                <option value="03">岩手県</option>
                <option value="04">宮城県</option>
                <option value="05">秋田県</option>
                <option value="06">山形県</option>
                <option value="07">福島県</option>
                <option value="08">茨城県</option>
                <option value="09">栃木県</option>
                <option value="10">群馬県</option>
                <option value="11">埼玉県</option>
                <option value="12">千葉県</option>
                <option value="13">東京都</option>
                <option value="14">神奈川県</option>
                <option value="15">新潟県</option>
                <option value="16">富山県</option>
                <option value="17">石川県</option>
                <option value="18">福井県</option>
                <option value="19">山梨県</option>
                <option value="20">長野県</option>
                <option value="21">岐阜県</option>
                <option value="22">静岡県</option>
                <option value="23">愛知県</option>
                <option value="24">三重県</option>
                <option value="25">滋賀県</option>
                <option value="26">京都府</option>
                <option value="27">大阪府</option>
                <option value="28">兵庫県</option>
                <option value="29">奈良県</option>
                <option value="30">和歌山県</option>
                <option value="31">鳥取県</option>
                <option value="32">島根県</option>
                <option value="33">岡山県</option>
                <option value="34">広島県</option>
                <option value="35">山口県</option>
                <option value="36">徳島県</option>
                <option value="37">香川県</option>
                <option value="38">愛媛県</option>
                <option value="39">高知県</option>
                <option value="40">福岡県</option>
                <option value="41">佐賀県</option>
                <option value="42">長崎県</option>
                <option value="43">熊本県</option>
                <option value="44">大分県</option>
                <option value="45">宮崎県</option>
                <option value="46">鹿児島県</option>
                <option value="47">沖縄県</option>
              </select>
              {timerRunning && (
                <Indicator className="absolute -top-1 -right-1" />
              )}
            </div>
          </div>

          <label htmlFor="form-city" className="form-label nogap">
            <span className="form-label-main required">市区町村</span>
            <span className="form-label-aux">(例: 川崎市川崎区)</span>
          </label>
          <div className="form-field-main">
            <div className="relative inline-block">
              <input
                id="form-city"
                type="text"
                autoComplete="shipping address-level2"
                placeholder="市区町村"
                className="form-field-elem md:w-52 w-full"
                {...register('city', {
                  required: '市区町村を入力してください',
                })}
              />
              {timerRunning && (
                <Indicator className="absolute -top-1 -right-1" />
              )}
            </div>
          </div>

          <label htmlFor="form-address1" className="form-label nogap">
            <span className="form-label-main required">町域・番地</span>
            <span className="form-label-aux">(例: 旭町1-1)</span>
          </label>
          <div className="form-field-main">
            <div className="relative inline-block">
              <input
                id="form-address1"
                type="text"
                autoComplete="shipping address-line1"
                placeholder="町域・番地"
                className="form-field-elem md:w-52 w-full"
                {...register('address1', {
                  required: '町域・番地を入力してください',
                })}
              />
              {timerRunning && (
                <Indicator className="absolute -top-1 -right-1" />
              )}
            </div>
          </div>

          <label htmlFor="form-address2" className="form-label nogap">
            <span className="form-label-main">建物名など</span>
            <span className="form-label-aux">(例: ○○マンション101号)</span>
          </label>
          <div className="form-field-main">
            <div className="relative inline-block">
              <input
                id="form-address2"
                type="text"
                autoComplete="shipping address-line2"
                placeholder="建物名など"
                className="form-field-elem w-full"
                {...register('address2')}
              />
              {timerRunning && (
                <Indicator className="absolute -top-1 -right-1" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex md:flex-row md:max-w-xl flex-col space-y-2 md:space-y-0 md:space-x-2">
          <button
            type="reset"
            className="rounded-md bg-gray-300 p-2 flex flex-1 justify-center item-center"
            onClick={() => reset()}
          >
            <span>フォームをリセットする</span>
          </button>
          <button
            type="submit"
            className="rounded-md bg-gray-300 p-2 flex flex-1 justify-center item-center"
          >
            <span>Submit (実際には何も起こりません)</span>
          </button>
        </div>
      </form>
    </>
  );
};

const Lookup: React.FunctionComponent = () => {
  return (
    <section className="flex flex-col">
      <header className="flex-1 align-center">
        <h1 className="mb-5 text-3xl font-bold text-gray-500">
          郵便番号正引き検索
        </h1>
      </header>
      <main className="flex-1">
        <Form />
      </main>
    </section>
  );
};

export default Lookup;
