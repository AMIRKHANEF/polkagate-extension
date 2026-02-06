// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@polkadot/extension-base/background/types';
import type { AlertContextType, APIsContext, CurrencyContextType, FetchingRequests, PricesContextType, ReferendaContextType, SelectedContextType, UserAddedChains } from '../util/types';

import React from 'react';

import { noop } from '@polkadot/util';

const AccountContext = React.createContext<AccountsContext>({ accounts: [], hierarchy: [], master: undefined });
const ActionContext = React.createContext<(to?: string) => void>(noop);
const APIContext = React.createContext<APIsContext>({ apis: {}, getApi: () => Promise.resolve(undefined) });
const AlertContext = React.createContext<AlertContextType>({ alerts: [], setAlerts: noop });
const AuthorizeReqContext = React.createContext<AuthorizeRequest[]>([]);
const CurrencyContext = React.createContext<CurrencyContextType>({ currency: undefined, setCurrency: noop });
const SelectedContext = React.createContext<SelectedContextType>({ selected: { account: undefined, chains: undefined, profile: undefined }, setSelected: noop });
const PricesContext = React.createContext<PricesContextType>({ prices: undefined, setPrices: noop });
const FetchingContext = React.createContext<FetchingRequests>({ fetching: {}, set: noop });
const ReferendaContext = React.createContext<ReferendaContextType>({ refs: {}, setRefs: noop });
const MediaContext = React.createContext<boolean>(false);
const MetadataReqContext = React.createContext<MetadataRequest[]>([]);
const SigningReqContext = React.createContext<SigningRequest[]>([]);
const ToastContext = React.createContext<({ show: (message: string) => void })>({ show: noop });
const UserAddedChainContext = React.createContext<UserAddedChains>({});
const WorkerContext = React.createContext<MessagePort | undefined>(undefined);

export { AccountContext,
  ActionContext,
  AlertContext,
  APIContext,
  AuthorizeReqContext,
  CurrencyContext,
  FetchingContext,
  MediaContext,
  MetadataReqContext,
  PricesContext,
  ReferendaContext,
  SelectedContext,
  SigningReqContext,
  ToastContext,
  UserAddedChainContext,
  WorkerContext };
