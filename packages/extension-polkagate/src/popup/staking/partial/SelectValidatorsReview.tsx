// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { BN } from '@polkadot/util';
import type { Proxy, ProxyItem, StakingConsts, TxInfo, ValidatorInfo } from '../../../util/types';

import { Container, Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { ActionContext, Motion, PasswordUseProxyConfirm, Popup, ShowValue, WrongPasswordAlert } from '../../../components';
import { useAccountDisplay, useEstimatedFee, useInfo, useProxies, useTranslation } from '../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../partials';
import Confirmation from '../../../partials/Confirmation';
import broadcast from '../../../util/api/broadcast';
import { PROXY_TYPE } from '../../../util/constants';
import { getSubstrateAddress, saveAsHistory } from '../../../util/utils';
import TxDetail from './TxDetail';
import ValidatorsTable from './ValidatorsTable';

interface Props {
  address: string;
  allValidatorsIdentities: DeriveAccountInfo[] | null | undefined
  api: ApiPromise | undefined;
  newSelectedValidators: ValidatorInfo[]
  poolId?: BN | number;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  stakingConsts: StakingConsts | null | undefined;
  staked: BN;
}

export default function Review({ address, allValidatorsIdentities, api, newSelectedValidators, poolId, setShow, show, staked, stakingConsts }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { chain, decimal, formatted, token } = useInfo(address);
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

  const nominated = api && (poolId ? api.tx['nominationPools']['nominate'] : api.tx['staking']['nominate']);
  const params = useMemo(() => {
    const selectedValidatorsAccountId = newSelectedValidators.map((v) => v.accountId);

    return poolId ? [poolId, selectedValidatorsAccountId] : [selectedValidatorsAccountId];
  }, [newSelectedValidators, poolId]);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));
  const estimatedFee = useEstimatedFee(address, nominated, params);

  const goToStakingHome = useCallback(() => {
    setShow(false);

    poolId ? onAction(`/pool/${address}`) : onAction(`/solo/${address}`);
  }, [address, onAction, poolId, setShow]);

  const goToMyAccounts = useCallback(() => {
    setShow(false);

    onAction('/');
  }, [onAction, setShow]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const nominate = useCallback(async () => {
    try {
      if (!formatted || !nominated || !api) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const { block, failureText, fee, success, txHash } = await broadcast(api, nominated, params, signer, formatted, selectedProxy);

      const info = {
        action: poolId ? 'Pool Staking' : 'Solo Staking',
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction: 'Select Validator',
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
  }, [api, chain, estimatedFee, poolId, formatted, name, nominated, params, password, selectedProxy, selectedProxyAddress, selectedProxyName]);

  const _onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Select Validators')}
          withSteps={{
            current: 2,
            total: 2
          }}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t('Review')} />
        <Container disableGutters sx={{ p: '15px 15px' }}>
          <Grid item textAlign='center'>
            {t('Validators ({{count}})', { replace: { count: newSelectedValidators.length } })}
          </Grid>
          <ValidatorsTable
            allValidatorsIdentities={allValidatorsIdentities}
            api={api}
            chain={chain}
            decimal={decimal}
            formatted={formatted}
            height={window.innerHeight - 320}
            staked={staked}
            stakingConsts={stakingConsts}
            token={token}
            validatorsToList={newSelectedValidators}
          />
          <Grid alignItems='center' container fontSize='14px' item justifyContent='flex-start' pt='10px'>
            <Grid item>
              {t('Fee')}:
            </Grid>
            <Grid fontWeight={400} item pl='5px'>
              <ShowValue height={16} value={estimatedFee?.toHuman()} />
            </Grid>
          </Grid>
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={nominate}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={poolId ? PROXY_TYPE.NOMINATION_POOLS : PROXY_TYPE.STAKING}
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
          title={t('Select Validators')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Select Validators')}
            onPrimaryBtnClick={goToStakingHome}
            onSecondaryBtnClick={goToMyAccounts}
            primaryBtnText={t('Staking Home')}
            secondaryBtnText={t('My Accounts')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail txInfo={txInfo} validatorsCount={newSelectedValidators.length} />
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
