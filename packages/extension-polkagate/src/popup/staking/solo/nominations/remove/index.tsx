// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { Proxy, ProxyItem, TxInfo } from '../../../../../util/types';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { AccountHolderWithProxy, ActionContext, Motion, PasswordUseProxyConfirm, Popup, ShowValue, WrongPasswordAlert } from '../../../../../components';
import { useAccountDisplay, useEstimatedFee, useProxies, useTranslation } from '../../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../../partials';
import Confirmation from '../../../../../partials/Confirmation';
import broadcast from '../../../../../util/api/broadcast';
import { PROXY_TYPE } from '../../../../../util/constants';
import { getSubstrateAddress, saveAsHistory } from '../../../../../util/utils';
import TxDetail from '../../../partial/TxDetail';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  formatted: string;
  title: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
}

export default function RemoveValidators({ address, api, chain, formatted, setShow, show, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const proxies = useProxies(api, formatted);
  const name = useAccountDisplay(address);
  const onAction = useContext(ActionContext);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const chilled = api?.tx['staking']['chill'];
  const estimatedFee = useEstimatedFee(address, chilled?.());

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/solo/${address}`);
  }, [address, onAction, setShow]);

  const goToMyAccounts = useCallback(() => {
    setShow(false);

    onAction('/');
  }, [onAction, setShow]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const remove = useCallback(async () => {
    try {
      if (!formatted || !api || !chilled) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const { block, failureText, fee, success, txHash } = await broadcast(api, chilled, [], signer, formatted, selectedProxy);

      const info = {
        action: 'Solo Staking',
        // amount,
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction: 'Remove Validators',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain: chain as any });

      saveAsHistory(from, info);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, chain, chilled, estimatedFee, formatted, name, password, selectedProxy, selectedProxyAddress, selectedProxyName]);

  const onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={title}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t('Review')} />
        <Grid container justifyContent='center' sx={{ px: '30px' }}>
          <AccountHolderWithProxy
            address={address}
            chain={chain}
            selectedProxyAddress={selectedProxyAddress}
            showDivider
          />
          <Typography fontSize='18px' fontWeight={400} py='25px' textAlign='center'>
            {t('There will be no selected validators and you will not get any rewards after.')}
          </Typography>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
          <Grid alignItems='center' container item justifyContent='center' pt='10px'>
            <Grid item>
              {t('Fee')}:
            </Grid>
            <Grid item sx={{ pl: '5px' }}>
              <ShowValue height={16} value={estimatedFee?.toHuman()} />
            </Grid>
          </Grid>
        </Grid>
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={remove}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={PROXY_TYPE.STAKING}
          selectedProxy={selectedProxy}
          setIsPasswordError={setIsPasswordError}
          setSelectedProxy={setSelectedProxy}
          style={{
            bottom: '80px',
            left: '4%',
            position: 'absolute',
            width: '92%'
          }}
        />
        <WaitScreen
          show={showWaitScreen}
          title={title}
        />
        {txInfo && (
          <Confirmation
            headerTitle={title}
            onPrimaryBtnClick={goToStakingHome}
            onSecondaryBtnClick={goToMyAccounts}
            primaryBtnText={t('Staking Home')}
            secondaryBtnText={t('My Accounts')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail txInfo={txInfo} validatorsCount={0} />
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
