// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { AccountId } from '@polkadot/types/interfaces';
import type { AccountStakingInfo, StakingConsts } from '../../../../util/types';

import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { DeriveStakingQuery } from '@polkadot/api-derive/types';
import { BN, BN_ZERO } from '@polkadot/util';

import { Infotip, Motion, PButton, Progress, Warning } from '../../../../components';
import { useApi, useChain, useFormatted, useStakingAccount, useStakingConsts, useTranslation, useValidators, useValidatorsIdentities } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import ValidatorsTable from './partials/ValidatorsTable';
import RemoveValidators from './remove';
import SelectValidators from './select';

interface State {
  api: ApiPromise | undefined;
  pathname: string;
  stakingConsts: StakingConsts | undefined
  stakingAccount: AccountStakingInfo | undefined
}

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const { state } = useLocation<State>();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const history = useHistory();
  const api = useApi(address, state?.api);
  const chain = useChain(address);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const allValidatorsInfo = useValidators(address);
  const allValidatorsAccountIds = useMemo(() => allValidatorsInfo && allValidatorsInfo.current.concat(allValidatorsInfo.waiting)?.map((v) => v.accountId), [allValidatorsInfo]);
  const allValidatorsIdentities = useValidatorsIdentities(address, allValidatorsAccountIds);
  const [refresh, setRefresh] = useState<boolean | undefined>(false);
  const formatted = useFormatted(address);
  const stakingAccount = useStakingAccount(formatted, state?.stakingAccount);
  const [selectedValidatorsId, setSelectedValidatorsId] = useState<AccountId[] | string[] | undefined | null>();
  const [showRemoveValidator, setShowRemoveValidator] = useState<boolean>(false);
  const [showSelectValidator, setShowSelectValidator] = useState<boolean>(false);

  const selectedValidatorsInfo = useMemo(() =>
    allValidatorsInfo && selectedValidatorsId && allValidatorsInfo.current
      .concat(allValidatorsInfo.waiting)
      .filter((v: DeriveStakingQuery) => selectedValidatorsId.includes(v.accountId))
  , [allValidatorsInfo, selectedValidatorsId]);

  const activeValidators = useMemo(() => selectedValidatorsInfo?.filter((sv) => sv.exposure.others.find(({ who }) => who.toString() === stakingAccount?.accountId?.toString())), [selectedValidatorsInfo, stakingAccount?.accountId]);

  useEffect(() => {
    setSelectedValidatorsId(stakingAccount === null || stakingAccount?.nominators?.length === 0 ? null : stakingAccount?.nominators.map((item) => item.toString()));
    setRefresh(false);
  }, [stakingAccount]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: state?.pathname ?? '/',
      state: { ...state }
    });
  }, [history, state]);

  const goToSelectValidator = useCallback(() => {
    setShowSelectValidator(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefresh(true);
    setSelectedValidatorsId(undefined);
  }, []);

  const onRemoveValidators = useCallback(() => {
    setShowRemoveValidator(true);
  }, []);

  const onChangeValidators = useCallback(() => {
    goToSelectValidator();
  }, [goToSelectValidator]);

  const Warn = ({ text }: { text: string }) => (
    <Grid container justifyContent='center' py='15px'    >
      <Warning
        fontWeight={400}
        theme={theme}
      >
        {text}
      </Warning>
    </Grid>
  );

  const ValidatorsActions = () => (
    <Grid container justifyContent='center' pt='15px' spacing={1}>
      <Grid item>
        <Typography onClick={onChangeValidators} sx={{ cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
          {t('Change Validators')}
        </Typography>
      </Grid>
      <Grid item>
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '19px', m: 'auto 2px', width: '2px' }} />
      </Grid>
      <Grid item>
        <Infotip text={t<string>('Use this to unselect validators. Note you will not get any rewards after.')}>
          <Typography onClick={onRemoveValidators} sx={{ cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
            {t('Remove Validators')}
          </Typography>
        </Infotip>
      </Grid>
    </Grid>
  );

  return (
    <Motion>
      <HeaderBrand
        onBackClick={onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Solo Staking')}
      />
      <SubTitle
        label={t<string>('Selected validators') + (selectedValidatorsId?.length ? ` (${selectedValidatorsId?.length})` : '')}
      />
      {(selectedValidatorsId === null || allValidatorsInfo === null) &&
        <>
          <Warn text={t<string>('No validator found.')} />
          <Grid alignItems='center' container direction='column' pt='98px'>
            <Grid item>
              <FontAwesomeIcon
                color={`${theme.palette.primary.light}`}
                icon={faRefresh}
                onClick={onRefresh}
                size='2x'
                spin={refresh}
              />
            </Grid>
            <Grid item sx={{ fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
              {t('Refresh')}
            </Grid>
          </Grid>
        </>
      }
      {(selectedValidatorsId === undefined || allValidatorsInfo === undefined) &&
        <Progress
          pt='125px'
          size={125}
          title={t('Loading the validators\' list ...')}
        />
      }
      <Grid item sx={{ m: '20px 15px' }} xs={12}>
        {selectedValidatorsId && allValidatorsInfo &&
          <>
            <ValidatorsTable
              activeValidators={activeValidators}
              api={api}
              chain={chain}
              height={window.innerHeight - 190}
              staked={stakingAccount?.stakingLedger?.active?.unwrap() ?? BN_ZERO}
              stakingConsts={stakingConsts}
              validatorsToList={selectedValidatorsInfo}
            />
            <ValidatorsActions />
          </>
        }
      </Grid>
      {selectedValidatorsId === null &&
        <PButton
          _onClick={goToSelectValidator}
          text={t<string>('Select Validator')}
        />
      }
      {showRemoveValidator &&
        <RemoveValidators
          address={address}
          api={api}
          chain={chain}
          formatted={formatted}
          setShow={setShowRemoveValidator}
          show={showRemoveValidator}
          title={t('Remove Selected Validators')}
        />
      }
      {showSelectValidator &&
        <SelectValidators
          address={address}
          allValidatorsIdentities={allValidatorsIdentities}
          allValidatorsInfo={allValidatorsInfo}
          api={api}
          chain={chain}
          formatted={formatted}
          selectedValidatorsId={selectedValidatorsId}
          setShow={setShowSelectValidator}
          stakingAccount={stakingAccount}
          show={showSelectValidator}
          stakingConsts={stakingConsts}
          title={t('Select Validators')}
        />
      }
    </Motion>
  );
}