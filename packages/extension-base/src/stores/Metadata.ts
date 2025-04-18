// Copyright 2019-2025 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDef } from '@polkadot/extension-inject/types';

import { EXTENSION_PREFIX } from '../defaults';
import BaseStore from './Base';

export default class MetadataStore extends BaseStore<MetadataDef> {
  constructor() {
    super(`${EXTENSION_PREFIX}metadata`);
  }
}
