// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens bondExtra review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { DeriveStakingAccount } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';
//@ts-ignore
import type { PalletNominationPoolsBondedPoolInner, PalletNominationPoolsPoolMember } from '@polkadot/types/lookup';
import type { MyPoolInfo, Proxy, ProxyItem, TxInfo } from '../../../../../util/types';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import keyring from '@polkadot/ui-keyring';
import { BN, BN_ZERO } from '@polkadot/util';

import { AccountHolderWithProxy, ActionContext, AmountFee, PasswordUseProxyConfirm, Popup, ShowBalance2, WrongPasswordAlert } from '../../../../../components';
import { useAccountDisplay, useChain, useFormatted, useProxies, useTranslation } from '../../../../../hooks';
import { Confirmation, HeaderBrand, SubTitle, WaitScreen } from '../../../../../partials';
import { broadcast } from '../../../../../util/api';
import { PROXY_TYPE } from '../../../../../util/constants';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../../../util/utils';
import BondExtraTxDetail from './partial/BondExtraTxDetail';

interface Props {
  api: ApiPromise;
  address: string;
  showReview: boolean;
  setShowReview: React.Dispatch<React.SetStateAction<boolean>>;
  bondAmount?: BN;
  estimatedFee?: Balance;
  pool: MyPoolInfo;
}

export default function Review({ address, api, bondAmount, estimatedFee, pool, setShowReview, showReview }: Props): React.ReactElement {
  const { t } = useTranslation();
  const chain = useChain(address);
  const onAction = useContext(ActionContext);
  const formatted = useFormatted(address);
  const name = useAccountDisplay(address);
  const proxies = useProxies(api, address);
  const decimals = api.registry.chainDecimals[0];

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));
  const totalStaked = new BN((pool.member as PalletNominationPoolsPoolMember).points).isZero() ? BN_ZERO : (new BN((pool.member as PalletNominationPoolsPoolMember).points).mul(new BN((pool.stashIdAccount as DeriveStakingAccount).stakingLedger.active as unknown as BN))).div(new BN((pool.bondedPool as PalletNominationPoolsBondedPoolInner).points));
  const bondExtra = api.tx['nominationPools']['bondExtra'];

  const _onBackClick = useCallback(() => {
    setShowReview(!showReview);
  }, [setShowReview, showReview]);

  const goToStakingHome = useCallback(() => {
    setShowReview(!showReview);
    onAction(`pool/${address}`);
  }, [address, onAction, setShowReview, showReview]);

  const BondExtra = useCallback(async () => {
    if (!formatted || !bondExtra) {
      return;
    }

    try {
      const from = selectedProxy?.delegate ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const params = [{ FreeBalance: bondAmount }];

      const { block, failureText, fee, success, txHash } = await broadcast(api, bondExtra, params, signer, address, selectedProxy);

      const info = {
        action: 'Pool Staking',
        amount: amountToHuman(bondAmount?.toString(), decimals),
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction: 'Stake',
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
  }, [address, api, bondAmount, bondExtra, chain, decimals, estimatedFee, formatted, name, password, selectedProxy, selectedProxyAddress, selectedProxyName]);

  useEffect(() => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  return (
    <>
      <Popup show={showReview}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Staking')}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t<string>('Review')} />
        <AccountHolderWithProxy
          address={address}
          chain={chain as any}
          selectedProxyAddress={selectedProxyAddress}
          showDivider
          style={{ m: 'auto', width: '90%' }
          }
        />
        <AmountFee
          address={address}
          amount={<ShowBalance2 address={address} balance={bondAmount} />}
          fee={estimatedFee}
          label={t('Amount')}
          showDivider
          style={{ pt: '5px' }}
          withFee
        />
        <Typography fontSize='16px' fontWeight={300} lineHeight='25px' textAlign='center'>
          {t<string>('Pool')}
        </Typography>
        <Grid fontSize='18px' fontWeight={400} m='auto' maxWidth='90%' overflow='hidden' textAlign='center' textOverflow='ellipsis' whiteSpace='nowrap'>
          {pool?.metadata}
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
        <AmountFee
          address={address}
          amount={<ShowBalance2 address={address} balance={bondAmount?.add(totalStaked)} />}
          label={t('Total stake after')}
          style={{ pt: '2px' }}
        />
        <PasswordUseProxyConfirm
          api={api}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={BondExtra}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
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
      </Popup>
      <WaitScreen
        show={showWaitScreen}
        title={t('Staking')}
      />
      {
        txInfo &&
        <Confirmation
          headerTitle={t('Pool Staking')}
          onPrimaryBtnClick={goToStakingHome}
          primaryBtnText={t('Staking Home')}
          showConfirmation={showConfirmation}
          txInfo={txInfo}
        >
          <BondExtraTxDetail pool={pool} txInfo={txInfo} />
        </Confirmation>
      }
    </>
  );
}
