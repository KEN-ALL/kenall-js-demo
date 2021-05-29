import React from 'react';
import Autosuggest, { OnSuggestionSelected, RenderSuggestionsContainer } from 'react-autosuggest';
import { KENALL, Address, AddressSearcherOptions } from '@ken-all/kenall';

type Candidates = {
  count: number;
  data: Address[];
}

const SENTINEL: Address = {
  jisx0402: "",
  old_code: "",
  postal_code: "",
  prefecture: "",
  prefecture_kana: "",
  city: "",
  city_kana: "",
  town: "",
  town_kana: "",
  town_raw: "",
  town_kana_raw: "",
  koaza: "",
  kyoto_street: "",
  building: "",
  floor: "",
  town_partial: false,
  town_addressed_koaza: false,
  town_multi: false,
  town_chome: false,
  corporation: null,
};

const apiBaseUrl = process.env.REACT_APP_KENALL_API_BASE_URL || 'https://api-beta.kenall.jp/v1';

const api = new KENALL(process.env.REACT_APP_KENALL_API_KEY as string, {apibase: apiBaseUrl, timeout: 10000})

type AddressSearcher = (options: AddressSearcherOptions) => Promise<Candidates>;

const searchAddresses: AddressSearcher = (() => {
  const cache: {[k: string]: Candidates;} = {};
  const generateKeyFromOptions = (options: AddressSearcherOptions): string => (
    `${options.query}:${options.limit}` 
  );
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

const Autocomplete: React.FunctionComponent = () => {
  const [address, setAddress] = React.useState<string>('');
  const [candidates, setCandidates] = React.useState<Candidates | Error | undefined>(undefined);

  const onCandidatesRequested = async ({ value: address }: { value: string }) => {
    setAddress(address);
    if (!address) {
      setCandidates(undefined);
      return;
    }
    try {
      const result = await searchAddresses({
        query: address,
        limit: 20,
      });
      setCandidates(result);
    } catch (e) {
      setCandidates(e);
    }
  };

  const onCandidatesClearRequested = () => {
    setCandidates(undefined);
  };

  const onCandidateSelected: OnSuggestionSelected<Address> = (e, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    setAddress(suggestionValue);
  };

  const renderCandidate = (candidate: Address) => (
    <>
      <span className="text-base font-mono w-24 flex-shrink-0">〒{candidate.postal_code.substring(0,3)}-{candidate.postal_code.substring(3)}</span>
      <span className="text-sm ml-2">{candidate.prefecture}{candidate.city}{candidate.town} {candidate.kyoto_street}{candidate.koaza}{candidate?.corporation?.block_lot}{candidate.building}{candidate.floor}</span>
    </>
  );

  const renderCandidatesContainer: RenderSuggestionsContainer = ({ containerProps, children }) => {
    const { ref, className, ...restOfContainerProps } = containerProps;
    return (
      <div {...restOfContainerProps} className={`${className} divide-y divide-gray-200 divide-solid`}>
        {candidates !== undefined && (
          candidates instanceof Error ? (
            <div ref={ref}>
              <ul className="react-autosuggest__suggestions-list">
                <li className="react-autosuggest__suggestion">
                  <span className="text-base text-red-300 mr-2">取得時にエラーが発生しました</span>
                  <span className="text-sm text-red-200">{candidates.message}</span>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <div className="overflow-y-scroll max-h-48" ref={ref}>{children}</div>
              <div className="text-sm text-gray-400 py-1 px-4 flex flex-row justify-end">
                <div>{String(candidates.count)}件</div>
              </div>
            </>
          )
        )}
      </div>
    );
  };

  return (
    <section className="flex flex-col">
      <style jsx global>{`
.react-autosuggest__container {
  @apply relative;
}

.react-autosuggest__input {
  @apply text-lg p-2 m-0 w-full rounded-md border border-gray-200;
}

.react-autosuggest__input--focused {
  @apply focus:outline-none;
}

.react-autosuggest__input--open {
}

.react-autosuggest__suggestions-container {
  @apply absolute z-10 hidden rounded-md border border-gray-200;
}

.react-autosuggest__suggestions-container--open {
  @apply block;
}

.react-autosuggest__suggestions-list {
  @apply m-0 p-0;
}

.react-autosuggest__suggestion {
  @apply cursor-pointer py-2 px-4 flex flex-row flex-nowrap items-baseline;
}

.react-autosuggest__suggestion--highlighted {
  @apply bg-blue-100;
}

.container {
  @apply flex;
}
      
      `}</style>
      <header className="flex-1 align-center">
        <h1 className="mb-5 text-3xl font-bold text-gray-500">Autocomplete</h1>
      </header>
      <main className="flex-1">
        <div>
          <div className="mb-2">
            <label>住所を入力</label>
            <p>
              例: <span className="bg-gray-200 p-1 mr-1">愛知県</span> <span className="bg-gray-200 p-1 mr-1">横浜市 港北区</span>
            </p>
          </div>
          <div className="text-lg w-full md:w-9/12">
            <Autosuggest
              suggestions={candidates !== undefined && !(candidates instanceof Error) ? candidates.data : [SENTINEL]}
              onSuggestionsFetchRequested={onCandidatesRequested}
              onSuggestionsClearRequested={onCandidatesClearRequested}
              onSuggestionSelected={onCandidateSelected}
              getSuggestionValue={(candidate) => `${candidate.prefecture}${candidate.city}${candidate.town} ${candidate.kyoto_street || ''}${candidate.koaza || ''}${candidate?.corporation?.block_lot || ''}${candidate.building || ''}${candidate.floor || ''}`}
              renderSuggestion={renderCandidate}
              renderSuggestionsContainer={renderCandidatesContainer}
              inputProps={{
                placeholder: '住所を入力',
                value: address,
                onChange: (e) => {
                  const value = (e.currentTarget as HTMLInputElement).value;
                  if (typeof value === 'string') {
                    setAddress((e.currentTarget as HTMLInputElement).value);
                  }
                },
              }}
            />
          </div>
        </div>
      </main>
    </section>
  );
};

export default Autocomplete;
