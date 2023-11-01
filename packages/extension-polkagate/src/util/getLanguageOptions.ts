// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface Option {
  info?: string;
  isDisabled?: boolean;
  isHeader?: boolean;
  text: React.ReactNode;
  value: string | number;
}

export default function getLanguageOptions (): Option[] {
  return [
    // default/native
    {
      text: 'English',
      value: 'en'
    },
    {
      text: '汉语',
      value: 'zh'
    },
    {
      text: 'Français',
      value: 'fr'
    },
    {
      text: 'Русский',
      value: 'ru'
    }
    // , // TODO:; will add others when its translation file is completed
    // {
    //   text: 'Türkce',
    //   value: 'tr'
    // },
    // {
    //   text: 'Polski',
    //   value: 'pl'
    // },
    // {
    //   text: 'ภาษาไทย',
    //   value: 'th'
    // },
    // {
    //   text: 'اردو',
    //   value: 'ur'
    // }
  ];
}