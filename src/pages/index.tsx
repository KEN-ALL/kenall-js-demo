import React from 'react';

const Index: React.FunctionComponent = () => {
  return (
    <section className="flex flex-col">
      <header>
        <h1 className="mb-5 text-3xl font-bold text-gray-500">
          ケンオール デモページ
        </h1>
      </header>
      <main>
        <p className="mb-2 hidden md:block">
          サイドバーからデモを選択してください。
        </p>
        <p className="mb-2 md:hidden">
          右上のハンバーガーメニューからデモを選択してください。
        </p>
        <p className="mb-2">
          このデモのソースコードは
          <a href="https://github.com/ken-all/kenall-js-demo">こちら</a>です。
        </p>
      </main>
    </section>
  );
};

export default Index;
