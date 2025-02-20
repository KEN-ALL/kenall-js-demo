import type { Address, AddressSearcherOptions } from '@ken-all/kenall';
import Downshift from 'downshift';
import React from 'react';
import { api } from '../kenall';

type Candidates = {
  count: number;
  data: Address[];
};

type AddressSearcher = (options: AddressSearcherOptions) => Promise<Candidates>;

const searchAddresses: AddressSearcher = (() => {
  const cache: { [k: string]: Candidates } = {};
  const generateKeyFromOptions = (options: AddressSearcherOptions): string =>
    `${options.q}:${options.limit}`;
  return async (options: AddressSearcherOptions) => {
    const k = generateKeyFromOptions(options);
    let candidates: Candidates | undefined = cache[k];
    if (candidates === undefined) {
      candidates = await api.searchAddresses(options);
      cache[k] = candidates;
    }
    return candidates;
  };
})();

const ReverseLookup: React.FunctionComponent = () => {
  const [candidates, setCandidates] = React.useState<
    Candidates | Error | undefined
  >(undefined);

  const onCandidatesRequested = async ({
    value: address,
  }: {
    value: string;
  }) => {
    if (!address) {
      setCandidates(undefined);
      return;
    }
    try {
      const result = await searchAddresses({
        q: address,
        limit: 20,
      });
      setCandidates(result);
    } catch (e) {
      setCandidates(e as Error);
    }
  };

  const candidateToAddress = (candidate: Address): string => {
    return candidate
      ? [
          [
            candidate.value,
            candidate.prefecture,
            candidate.city,
            candidate.town,
          ].join(''),
          [
            candidate.kyoto_street || '',
            candidate.koaza || '',
            candidate?.corporation?.block_lot || '',
            candidate.building || '',
            candidate.floor || '',
          ].join(''),
        ]
          .filter((part) => !!part)
          .join(' ')
      : '';
  };

  return (
    <section className="flex flex-col">
      <header className="flex-1 align-center">
        <h1 className="mb-5 text-3xl font-bold text-gray-500">
          郵便番号逆引き検索
        </h1>
      </header>
      <main className="flex-1">
        <Downshift
          onInputValueChange={(inputValue) =>
            onCandidatesRequested({ value: inputValue })
          }
          itemToString={(item) => candidateToAddress(item)}
        >
          {({
            getInputProps,
            getItemProps,
            getLabelProps,
            getMenuProps,
            highlightedIndex,
            getRootProps,
          }) => (
            <div>
              <div className="mb-2">
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label {...getLabelProps()}>住所を入力</label>
                <p>
                  例: <span className="bg-gray-200 p-1 mr-1">愛知県</span>{' '}
                  <span className="bg-gray-200 p-1 mr-1">横浜市 港北区</span>
                </p>
              </div>
              <div className="text-lg w-full md:w-9/12 relative">
                <div {...getRootProps({}, { suppressRefError: true })}>
                  <input {...getInputProps()} />
                </div>
                <div className="suggestions divide-y divide-gray-200 divide-solid">
                  <ul
                    {...getMenuProps()}
                    className="overflow-y-scroll max-h-48"
                  >
                    {candidates && !(candidates instanceof Error)
                      ? candidates.data.map((candidate, i) => (
                          <li
                            {...getItemProps({
                              key: i,
                              index: i,
                              item: candidate,
                            })}
                            key={
                              // biome-ignore lint/suspicious/noArrayIndexKey:
                              i
                            }
                            aria-selected={
                              highlightedIndex === i ? 'true' : 'false'
                            }
                          >
                            <span className="text-base font-mono w-24 flex-shrink-0">
                              〒{candidate.postal_code.substring(0, 3)}-
                              {candidate.postal_code.substring(3)}
                            </span>
                            <span className="text-sm ml-2">
                              {candidateToAddress(candidate)}
                            </span>
                          </li>
                        ))
                      : null}
                  </ul>
                  {candidates && !(candidates instanceof Error) && (
                    <div className="text-sm text-gray-600 py-1 px-4 flex flex-row justify-end">
                      <div>{String(candidates.count)}件</div>
                    </div>
                  )}
                </div>
                {candidates instanceof Error && (
                  <div>
                    <span className="text-base text-red-500 mr-2">
                      取得時にエラーが発生しました
                    </span>
                    <span className="text-sm text-red-600">
                      {candidates.message}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Downshift>
      </main>
    </section>
  );
};

export default ReverseLookup;
