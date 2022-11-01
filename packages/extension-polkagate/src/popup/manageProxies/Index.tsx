// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddRounded as AddRoundedIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BN, BN_ZERO } from '@polkadot/util';

import { ActionContext, PButton, ProxyTable, ShowBalance } from '../../components';
import { useAccount, useApi, useEndpoint, useMetadata, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { Proxy, ProxyItem } from '../../util/types';
import { getFormattedAddress } from '../../util/utils';
import AddProxy from './AddProxy';

interface Props {
  className?: string;
}

export default function ManageProxies({ className }: Props): React.ReactElement {
  const [proxyItems, setProxyItems] = useState<ProxyItem[] | undefined>();
  const [proxies, setProxies] = useState<Proxy[] | undefined>();
  const [showAddProxy, setShowAddProxy] = useState<boolean>(false);
  const [formatted, setFormatted] = useState<string | undefined>();
  const [depositValue, setDepositValue] = useState<BN | undefined>();
  const [disableAddProxyButton, setEnableAddProxyButton] = useState<boolean>(true);
  const [disableToConfirmButton, setEnableToConfirmButton] = useState<boolean>(true);

  const onAction = useContext(ActionContext);
  const { t } = useTranslation();
  const { address } = useParams<{ address: string; }>();
  const account = useAccount(address);
  const chain = useMetadata(account?.genesisHash, true);
  const endpoint = useEndpoint(account?.address, chain);
  const api = useApi(endpoint);

  const proxyDepositBase = api ? api.consts.proxy.proxyDepositBase : BN_ZERO;
  const proxyDepositFactor = api ? api.consts.proxy.proxyDepositFactor : BN_ZERO;
  const available = proxyItems?.filter((item) => item.status !== 'remove')?.length ?? 0;

  const _onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const _openAddProxy = useCallback(() => {
    !disableAddProxyButton && setShowAddProxy(!showAddProxy);
  }, [disableAddProxyButton, showAddProxy]);

  const _toConfirm = useCallback(() => {
    !disableAddProxyButton && setShowAddProxy(!showAddProxy);
  }, [disableAddProxyButton, showAddProxy]);

  useEffect(() => {
    if (!disableAddProxyButton) {
      const anyChanges = proxyItems?.length === proxyItems?.filter((item) => item.status === 'current')?.length;

      !anyChanges && setEnableToConfirmButton(false);
    }
  }, [disableAddProxyButton, proxyItems, proxyItems?.length]);

  useEffect(() => {
    chain && setFormatted(getFormattedAddress(address, undefined, chain.ss58Format));
    !available ? setDepositValue(BN_ZERO) : setDepositValue(proxyDepositBase.add(proxyDepositFactor.muln(available))) as unknown as BN;
  }, [address, api, available, chain, formatted, proxyDepositBase, proxyDepositFactor]);

  useEffect(() => {
    proxyItems !== undefined && !(account?.isExternal && proxyItems.length === 0) && setEnableAddProxyButton(false);
  }, [account?.isExternal, proxyItems]);

  useEffect(() => {
    formatted && api && api.query.proxy?.proxies(formatted).then((proxies) => {
      const fetchedProxyItems = (JSON.parse(JSON.stringify(proxies[0])))?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

      setProxyItems(fetchedProxyItems);
    });
  }, [api, chain, formatted]);

  useEffect(() => {
    const prox: Proxy[] = [];

    proxyItems && proxyItems.forEach((item) => {
      prox.push(item.proxy);
    });
    setProxies(prox);
  }, [proxyItems?.length, proxyItems]);

  return (
    <>
      <HeaderBrand
        onBackClick={showAddProxy ? _openAddProxy : _onBackClick}
        showBackArrow
        text={showAddProxy ? t<string>('Add Proxy') : t<string>('Manage Proxies')}
      />
      {!showAddProxy &&
        <>
          <Typography
            fontSize='14px'
            fontWeight={300}
            m='25px auto'
            textAlign='left'
            width='90%'
          >
            {t<string>('Add new or select to remove proxies for this account, consider the deposit that will be reserved.')}
          </Typography>
          <Grid
            container
            m='auto'
            sx={{
              opacity: disableAddProxyButton ? 0.5 : 1
            }}
            width='92%'
          >
            <Grid
              display='inline-flex'
              item
              onClick={_openAddProxy}
              sx={{
                cursor: disableAddProxyButton ? 'context-menu' : 'pointer'
              }}
            >
              <AddRoundedIcon
                sx={{
                  bgcolor: 'primary.main',
                  borderRadius: '50px',
                  color: 'background.default',
                  fontSize: '36px'
                }}
              />
              <Typography
                fontSize='16px'
                fontWeight={400}
                lineHeight='36px'
                pl='10px'
                sx={{
                  textDecoration: 'underline'
                }}
              >
                {t<string>('Add proxy')}
              </Typography>
            </Grid>
          </Grid>
          <ProxyTable
            chain={chain}
            label={t<string>('Proxies')}
            maxHeight={window.innerHeight / 2.3}
            notFoundText={t<string>('No proxies found.')}
            proxies={proxyItems ? proxies : undefined}
            style={{
              m: '20px auto 10px',
              width: '92%'
            }}
          />
          <Grid
            alignItems='end'
            container
            sx={{
              m: 'auto',
              width: '92%'
            }}
          >
            <Typography
              fontSize='14px'
              fontWeight={300}
              lineHeight='23px'
            >
              {t<string>('Deposit:')}
            </Typography>
            <Grid
              item
              lineHeight='22px'
              pl='5px'
            >
              <ShowBalance
                api={api}
                balance={depositValue}
                decimalPoint={4}
                height={22}
              />
            </Grid>
          </Grid>
          <PButton
            _onClick={_toConfirm}
            disabled={disableToConfirmButton}
            text={t<string>('Next')}
          />
        </>
      }
      {showAddProxy &&
        <AddProxy
          address={address}
          api={api}
          chain={chain}
          proxyItems={proxyItems}
          setProxyItems={setProxyItems}
          setShowAddProxy={setShowAddProxy}
          showAddProxy={showAddProxy}
        />
      }
    </>
  );
}