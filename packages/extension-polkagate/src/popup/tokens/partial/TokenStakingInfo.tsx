// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FetchedBalance } from '../../../hooks/useAssetsBalances';

import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { BN_ZERO, noop } from '@polkadot/util';

import { ActionContext, ToggleDots } from '../../../components';
import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { usePrices, useTranslation } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import { ColumnAmounts } from './ColumnAmounts';

interface TokenStakingInfoProp {
  tokenDetail: FetchedBalance | undefined;
  address: string | undefined;
}

enum STAKING_TYPE {
  SOLO,
  POOL
}

function TokenStakingInfo({ address, tokenDetail }: TokenStakingInfoProp) {
  const { t } = useTranslation();
  const theme = useTheme();

  const onAction = useContext(ActionContext);
  const pricesInCurrency = usePrices();

  const [state, setState] = useState<STAKING_TYPE>();

  const stakings = useMemo(() => {
    if (!tokenDetail) {
      return undefined;
    }

    const hasPoolStake = tokenDetail.pooledBalance && !tokenDetail.pooledBalance?.isZero();
    const hasSoloStake = tokenDetail.soloTotal && !tokenDetail.soloTotal.isZero();

    return {
      hasPoolStake,
      hasSoloStake
    };
  }, [tokenDetail]);

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const isDoubleStaked = stakings?.hasPoolStake && stakings.hasSoloStake;
  const stakedAmount = (state === STAKING_TYPE.POOL ? tokenDetail?.pooledBalance : tokenDetail?.soloTotal) ?? BN_ZERO;
  const totalBalance = useMemo(() => calcPrice(priceOf(tokenDetail?.priceId ?? '0'), stakedAmount, tokenDetail?.decimal ?? 0), [priceOf, stakedAmount, tokenDetail?.decimal, tokenDetail?.priceId]);
  const notStaked = useMemo(() => stakings && !stakings.hasPoolStake && !stakings.hasSoloStake, [stakings]);

  useEffect(() => {
    if (state === undefined && stakings) {
      setState(stakings.hasPoolStake ? STAKING_TYPE.POOL : STAKING_TYPE.SOLO);
    }
  }, [stakings, state]);

  const toggleState = useCallback(() => {
    if (isDoubleStaked) {
      setState((prevState) => prevState === STAKING_TYPE.POOL ? STAKING_TYPE.SOLO : STAKING_TYPE.POOL);
    }
  }, [isDoubleStaked]);

  const goToStaking = useCallback(() => {
    if (notStaked) {
      return;
    }

    const path = state === STAKING_TYPE.POOL
      ? `/pool/${address}`
      : `/solo/${address}`;

    onAction(path);
  }, [address, notStaked, onAction, state]);

  return (
    <Container disableGutters onClick={isDoubleStaked ? noop : goToStaking} sx={{ ':hover': notStaked ? {} : { background: '#2D1E4A' }, alignItems: 'center', background: '#2D1E4A4D', borderRadius: '14px', cursor: notStaked ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between', p: '12px', rowGap: '8px', transition: 'all 250ms ease-out' }}>
      <Stack>
        <Grid alignItems='center' container item onClick={toggleState} sx={{ columnGap: '4px', cursor: isDoubleStaked ? 'pointer' : 'default', width: 'fit-content' }}>
          {state === STAKING_TYPE.POOL
            ? <Ice size='20' />
            : <SnowFlake size='20' />
          }
          <Typography color='text.secondary' variant='B-1'>
            {state === STAKING_TYPE.POOL
              ? t('Pool Staking')
              : t('Solo Staking')
            }
          </Typography>
          {isDoubleStaked &&
            <>
              <UnfoldMoreIcon sx={{ color: state === STAKING_TYPE.POOL ? '#EAEBF1' : '#AA83DC', fontSize: '17px' }} />
              <ToggleDots active={state === STAKING_TYPE.POOL} />
            </>
          }
        </Grid>
        {state === STAKING_TYPE.POOL &&
          <Typography color={theme.palette.label.primary} variant='B-5'>
            {tokenDetail?.poolName ?? 'Unknown'}
          </Typography>
        }
      </Stack>
      <Grid alignItems='center' container item sx={{ rowGap: '4px', width: 'fit-content' }}>
        <ColumnAmounts
          cryptoAmount={stakedAmount}
          decimal={tokenDetail?.decimal ?? 0}
          fiatAmount={totalBalance}
          token={tokenDetail?.token ?? ''}
        />
      </Grid>
    </Container>
  );
}

export default memo(TokenStakingInfo);
