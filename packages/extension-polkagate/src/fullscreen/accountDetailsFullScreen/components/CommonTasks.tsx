// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faHistory, faPaperPlane, faPiggyBank, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon, Boy as BoyIcon, QrCode2 as QrCodeIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { BalancesInfo } from 'extension-polkagate/src/util/types';
import React, { useCallback, useContext, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';

import { ActionContext, PoolStakingIcon } from '../../../components';
import { useTranslation } from '../../../hooks';
import { FetchedBalance } from '../../../hooks/useAssetsBalances';
import { windowOpen } from '../../../messaging';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../../util/constants';
import { popupNumbers } from '..';

interface Props {
  address: string | undefined;
  assetId: number | undefined;
  balance: BalancesInfo | FetchedBalance | undefined;
  genesisHash: string | null | undefined;
  api: ApiPromise | undefined;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

interface TaskButtonProps {
  icon: unknown;
  text: string;
  onClick: () => void;
  secondaryIconType: 'popup' | 'page';
  noBorderButton?: boolean;
  disabled?: boolean;
}

export const TaskButton = ({ disabled, icon, noBorderButton = false, onClick, secondaryIconType, text }: TaskButtonProps) => {
  const theme = useTheme();

  return (
    <>
      {/* eslint-disable-next-line react/jsx-no-bind */}
      <Grid alignItems='center' container item justifyContent='space-between' onClick={disabled ? () => null : onClick} sx={{ '&:hover': { bgcolor: disabled ? 'transparent' : 'divider' }, borderRadius: '5px', cursor: disabled ? 'default' : 'pointer', m: 'auto', minHeight: '45px', p: '5px 10px' }} width='90%'>
        <Grid container item xs={3}>
          {icon}
        </Grid>
        <Grid container item xs>
          <Typography color={disabled ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='16px' fontWeight={500}>
            {text}
          </Typography>
        </Grid>
        {secondaryIconType === 'page' &&
          <Grid alignItems='center' container item justifyContent='flex-end' xs={2}>
            <ArrowForwardIosRoundedIcon sx={{ color: disabled ? 'text.disabled' : 'secondary.light', fontSize: '26px', stroke: disabled ? theme.palette.text.disabled : theme.palette.secondary.light, strokeWidth: 1 }} />
          </Grid>
        }
      </Grid>
      {!noBorderButton && <Divider sx={{ bgcolor: 'divider', height: '2px', m: '5px auto', width: '85%' }} />
      }
    </>
  );
};

export default function CommonTasks({ address, api, assetId, balance, genesisHash, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const history = useHistory();
  const onAction = useContext(ActionContext);

  const governanceDisabled = useMemo(() => !GOVERNANCE_CHAINS.includes(genesisHash ?? ''), [genesisHash]);
  const stakingDisabled = useMemo(() => !STAKING_CHAINS.includes(genesisHash ?? ''), [genesisHash]);
  const crowdloanDisabled = useMemo(() => !CROWDLOANS_CHAINS.includes(genesisHash ?? ''), [genesisHash]);
  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const stakingIconColor = useMemo(() => stakingDisabled ? theme.palette.action.disabledBackground : theme.palette.text.primary, [stakingDisabled, theme.palette.action.disabledBackground, theme.palette.text.primary]);

  const goToSend = useCallback(() => {
    address && genesisHash && onAction(`/send/${address}/${assetId}`);
  }, [address, assetId, genesisHash, onAction]);

  const goToReceive = useCallback(() => {
    address && genesisHash && setDisplayPopup(popupNumbers.RECEIVE);
  }, [address, genesisHash, setDisplayPopup]);

  const goToGovernance = useCallback(() => {
    address && genesisHash && !governanceDisabled && windowOpen(`/governance/${address}/referenda`).catch(console.error);
  }, [address, genesisHash, governanceDisabled]);

  const goToSoloStaking = useCallback(() => {
    address && genesisHash && !stakingDisabled &&
      history.push({
        pathname: `/solo/${address}/`,
        state: { api, pathname: `account/${address}` }
      });
  }, [address, api, genesisHash, history, stakingDisabled]);

  const goToPoolStaking = useCallback(() => {
    address && genesisHash && !stakingDisabled && history.push({
      pathname: `/pool/${address}/`,
      state: { api, pathname: `account/${address}` }
    });
  }, [address, api, genesisHash, history, stakingDisabled]);

  const goToCrowdLoans = useCallback(() => {
    address && genesisHash && !crowdloanDisabled && onAction(`/crowdloans/${address}/`);
  }, [address, crowdloanDisabled, genesisHash, onAction]);

  const goToHistory = useCallback(() => {
    address && genesisHash && setDisplayPopup(popupNumbers.HISTORY);
  }, [address, genesisHash, setDisplayPopup]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px' }} width='inherit'>
      <Typography fontSize='22px' fontWeight={700}>
        {t('Most common tasks')}
      </Typography>
      <Divider sx={{ bgcolor: 'divider', height: '2px', m: '5px auto 15px', width: '90%' }} />
      <Grid alignItems='center' container direction='column' display='block' item justifyContent='center'>
        <TaskButton
          disabled={!genesisHash}
          icon={
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              fontSize='28px'
              icon={faPaperPlane}
            />
          }
          onClick={goToSend}
          secondaryIconType='page'
          text={t('Send Fund')}
        />
        <TaskButton
          disabled={!genesisHash}
          icon={
            <QrCodeIcon sx={{ color: 'text.primary', cursor: 'pointer', fontSize: '35px' }} />
          }
          onClick={goToReceive}
          secondaryIconType='popup'
          text={t('Receive Fund')}
        />
        <TaskButton
          disabled={governanceDisabled}
          icon={
            <FontAwesomeIcon
              color={governanceDisabled ? theme.palette.action.disabledBackground : theme.palette.text.primary}
              fontSize='28px'
              icon={faVoteYea}
            />
          }
          onClick={goToGovernance}
          secondaryIconType='page'
          text={t('Governance')}
        />
        <TaskButton
          disabled={stakingDisabled}
          icon={
            <Grid sx={{ position: 'relative' }}>
              <BoyIcon sx={{ color: stakingIconColor, fontSize: '35px' }} />
              {balance?.soloTotal && !balance.soloTotal.isZero() &&
                <span style={{ backgroundColor: '#00FF00', border: `1px solid ${theme.palette.background.default}`, borderRadius: '50%', height: '10px', position: 'absolute', right: '6px', top: '33%', width: '10px' }} />
              }
            </Grid>
          }
          onClick={goToSoloStaking}
          secondaryIconType='page'
          text={t('Solo Stake')}
        />
        <TaskButton
          disabled={stakingDisabled}
          icon={
            <Grid sx={{ position: 'relative' }}>
              <PoolStakingIcon color={stakingIconColor} height={35} width={35} />
              {balance?.pooledBalance && !balance.pooledBalance.isZero() &&
                <span style={{ backgroundColor: '#00FF00', border: `1px solid ${theme.palette.background.default}`, borderRadius: '50%', height: '10px', position: 'absolute', right: '-1px', top: '33%', width: '10px' }} />
              }
            </Grid>
          }
          onClick={goToPoolStaking}
          secondaryIconType='page'
          text={t('Pool Stake')}
        />
        <TaskButton
          disabled={crowdloanDisabled}
          icon={
            <FontAwesomeIcon
              color={crowdloanDisabled ? theme.palette.action.disabledBackground : theme.palette.text.primary}
              flip='horizontal'
              fontSize='28px'
              icon={faPiggyBank}
            />
          }
          onClick={goToCrowdLoans}
          secondaryIconType='page'
          text={t('Crowdloans')}
        />
        <TaskButton
          disabled={!genesisHash}
          icon={
            <FontAwesomeIcon
              color={`${theme.palette.text.primary}`}
              fontSize='28px'
              icon={faHistory}
            />
          }
          noBorderButton
          onClick={goToHistory}
          secondaryIconType='popup'
          text={t('History')}
        />
      </Grid>
    </Grid>
  );
}
