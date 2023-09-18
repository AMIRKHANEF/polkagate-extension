// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletNominationPoolsPoolMember, PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { socialRecoveryDark, socialRecoveryLight } from '../../assets/icons';
import { PButton, TwoButtons } from '../../components';
import { useAccountsInfo, useChain, useCurrentBlockNumber, useDecimal, useToken, useTranslation } from '../../hooks';
import { ActiveRecoveryFor } from '../../hooks/useActiveRecoveries';
import getPoolAccounts from '../../util/getPoolAccounts';
import SelectTrustedFriend, { FriendWithId } from './components/SelectTrustedFriend';
import ActiveProxyStatus from './partial/ActiveProxyStatus';
import InitiatedRecoveryStatus from './partial/InitiatedRecoveryStatus';
import LostAccountRecoveryInfo from './partial/LostAccountRecoveryInfo';
import recoveryDelayPeriod from './util/recoveryDelayPeriod';
import { InitiateRecoveryConfig, SocialRecoveryModes, STEPS, WithdrawInfo } from '.';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  mode: SocialRecoveryModes;
  setMode: React.Dispatch<React.SetStateAction<SocialRecoveryModes>>;
  setTotalDeposit: React.Dispatch<React.SetStateAction<BN>>;
  setLostAccountAddress: React.Dispatch<React.SetStateAction<InitiateRecoveryConfig | undefined>>;
  initiatedRecovery: ActiveRecoveryFor | null;
  setWithdrawInfo: React.Dispatch<React.SetStateAction<WithdrawInfo>>;
  withdrawInfo: WithdrawInfo;
  activeProxy: string | null;
}

interface SessionInfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

export default function InitiateRecovery({ activeProxy, address, api, formatted, initiatedRecovery, mode, setLostAccountAddress, setMode, setStep, setTotalDeposit, setWithdrawInfo, withdrawInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const accountsInfo = useAccountsInfo(api, chain);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const currentBlockNumber = useCurrentBlockNumber(address);

  const [lostAccount, setLostAccount] = useState<FriendWithId>();
  const [lostAccountBalance, setLostAccountBalance] = useState<Balance | undefined>();
  const [lostAccountRedeemable, setLostAccountRedeemable] = useState<Balance | undefined>();
  const [lostAccountSoloStakingBalance, setLostAccountSoloStakingBalance] = useState<BN | undefined>();
  const [lostAccountPoolStakingBalance, setLostAccountPoolStakingBalance] = useState<BN | undefined>();
  const [lostAccountReserved, setLostAccountReserved] = useState<BN | undefined>();
  const [lostAccountSoloUnlock, setLostAccountSoloUnlock] = useState<{ amount: BN, date: number } | undefined>();
  const [alreadyClaimed, setAlreadyClaimed] = useState<boolean | undefined>();
  const [lostAccountIdentity, setLostAccountIdentity] = useState<boolean | undefined>();
  const [lostAccountRecoveryInfo, setLostAccountRecoveryInfo] = useState<PalletRecoveryRecoveryConfig | null | undefined | false>(false);
  const [fetchingLostAccountInfos, setFetchingLostAccountInfos] = useState<boolean>(false);
  const [goReview, setGoReview] = useState<boolean>(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>();

  const recoveryDeposit = useMemo(() => api ? new BN(api.consts.recovery.recoveryDeposit.toString()) : BN_ZERO, [api]);
  const delayEndBlock = useMemo(() => (initiatedRecovery?.createdBlock ?? 0) + (lostAccountRecoveryInfo ? lostAccountRecoveryInfo?.delayPeriod?.toNumber() : 0), [initiatedRecovery?.createdBlock, lostAccountRecoveryInfo]);
  const isDelayPassed = useMemo(() => {
    if (!initiatedRecovery || !lostAccountRecoveryInfo || !currentBlockNumber || delayEndBlock === 0) {
      return undefined;
    }

    if (delayEndBlock < currentBlockNumber) {
      return true;
    } else {
      return false;
    }
  }, [currentBlockNumber, delayEndBlock, initiatedRecovery, lostAccountRecoveryInfo]);
  const isVouchedCompleted = useMemo(() => {
    if (!initiatedRecovery || !lostAccountRecoveryInfo) {
      return undefined;
    }

    const isEnoughVouched = initiatedRecovery.vouchedFriends.length >= lostAccountRecoveryInfo.threshold.toNumber();

    return isEnoughVouched;
  }, [initiatedRecovery, lostAccountRecoveryInfo]);

  const nextBtnDisable = useMemo(() => {
    if (activeProxy || initiatedRecovery) {
      return (lostAccountRecoveryInfo === undefined || lostAccountRecoveryInfo === null || !isVouchedCompleted || !lostAccount?.address || (isVouchedCompleted && isDelayPassed === false));
    } else if (!lostAccount?.address) {
      return true;
    } else if (lostAccount.address && lostAccountRecoveryInfo) {
      return false;
    } else if (lostAccount.address && lostAccountRecoveryInfo === false) {
      return false;
    } else {
      return true;
    }
  }, [activeProxy, initiatedRecovery, isDelayPassed, isVouchedCompleted, lostAccount?.address, lostAccountRecoveryInfo]);

  useEffect(() => {
    api && api.derive.session?.progress().then((sessionInfo) => {
      setSessionInfo({
        currentEra: Number(sessionInfo.currentEra),
        eraLength: Number(sessionInfo.eraLength),
        eraProgress: Number(sessionInfo.eraProgress)
      });
    });
  }, [api]);

  const checkLostAccountRecoverability = useCallback(() => {
    if (api && lostAccount) {
      setLostAccountRecoveryInfo(undefined);

      api.query.recovery.recoverable(lostAccount.address).then((r) => {
        setLostAccountRecoveryInfo(r.isSome ? r.unwrap() as unknown as PalletRecoveryRecoveryConfig : null);
        mode === 'Withdraw' && setTotalDeposit(r.isSome ? r.unwrap().deposit as BN : BN_ZERO);
      }).catch(console.error);
    }
  }, [api, lostAccount, mode, setTotalDeposit]);

  const checkLostAccountBalance = useCallback(() => {
    if (api && lostAccount) {
      api.derive.balances.all(lostAccount.address).then((b) => {
        setLostAccountBalance(b.availableBalance);
        setLostAccountReserved(b.reservedBalance);
      }).catch(console.error);
    }
  }, [api, lostAccount]);

  const checkLostAccountSoloStakedBalance = useCallback(() => {
    if (api && lostAccount && sessionInfo) {
      api.derive.staking.account(lostAccount.address).then((s) => {
        setLostAccountSoloStakingBalance(new BN(s.stakingLedger.active.toString()));

        let unlockingValue = BN_ZERO;
        const toBeReleased: { amount: BN, date: number }[] = [];

        if (s?.unlocking) {
          for (const [_, { remainingEras, value }] of Object.entries(s.unlocking)) {
            if (remainingEras.gtn(0)) {
              const amount = new BN(value as unknown as string);

              unlockingValue = unlockingValue.add(amount);

              const secToBeReleased = (Number(remainingEras) * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

              toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
            }
          }
        }

        setLostAccountSoloUnlock({ amount: unlockingValue, date: toBeReleased.at(-1)?.date ?? 0 });
        setLostAccountRedeemable(s.redeemable);
      }).catch(console.error);
    }
  }, [api, lostAccount, sessionInfo]);

  const checkLostAccountClaimedStatus = useCallback(() => {
    if (api && lostAccount) {
      api.query.recovery.proxy(formatted).then((p) => {
        if (p.isEmpty) {
          setAlreadyClaimed(false);

          return;
        }

        const proxies: string = p.toHuman() as string;

        setAlreadyClaimed(proxies === lostAccount.address);
      }).catch(console.error);
    }
  }, [api, formatted, lostAccount]);

  const checkLostAccountIdentity = useCallback(() => {
    if (accountsInfo && lostAccount) {
      const hasId = !!accountsInfo.find((accountInfo) => accountInfo.accountId?.toString() === lostAccount.address);

      setLostAccountIdentity(hasId);
    }
  }, [accountsInfo, lostAccount]);

  const checkLostAccountPoolStakedBalance = useCallback(() => {
    if (api && lostAccount) {
      api.query.nominationPools.poolMembers(lostAccount.address).then(async (res) => {
        const member = res?.unwrapOr(undefined) as PalletNominationPoolsPoolMember | undefined;

        if (!member) {
          setLostAccountPoolStakingBalance(BN_ZERO);

          return;
        }

        const poolId = member.poolId;
        const accounts = poolId && getPoolAccounts(api, poolId);

        if (!accounts) {
          setLostAccountPoolStakingBalance(BN_ZERO);

          return;
        }

        const [bondedPool, stashIdAccount, myClaimable] = await Promise.all([
          api.query.nominationPools.bondedPools(poolId),
          api.derive.staking.account(accounts.stashId),
          api.call.nominationPoolsApi.pendingRewards(formatted)
        ]);

        const active = member.points.isZero()
          ? BN_ZERO
          : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPool.unwrap()?.points ?? BN_ONE)));
        const rewards = myClaimable as Balance;
        let unlockingValue = BN_ZERO;

        member?.unbondingEras?.forEach((value) => {
          unlockingValue = unlockingValue.add(value);
        });

        setLostAccountPoolStakingBalance(active.add(rewards).add(unlockingValue));
      }).catch(console.error);
    }
  }, [api, formatted, lostAccount]);

  useEffect(() => {
    if ((initiatedRecovery || activeProxy) && !lostAccount) {
      setLostAccount({ accountIdentity: undefined, address: activeProxy ?? initiatedRecovery?.lost ?? '' });
    }
  }, [activeProxy, checkLostAccountRecoverability, initiatedRecovery, lostAccount]);

  useEffect(() => {
    if (initiatedRecovery && lostAccount && lostAccountRecoveryInfo === false) {
      checkLostAccountRecoverability();
    }
  }, [checkLostAccountRecoverability, initiatedRecovery, lostAccount, lostAccountRecoveryInfo]);

  useEffect(() => {
    if (!lostAccount && lostAccountRecoveryInfo !== false) {
      setLostAccountRecoveryInfo(false);
    }
  }, [lostAccount, lostAccount?.address, lostAccountRecoveryInfo]);

  useEffect(() => {
    if (fetchingLostAccountInfos || !api || !formatted || (!lostAccountRecoveryInfo && !activeProxy) || withdrawInfo || !lostAccount?.address || !accountsInfo || !sessionInfo) {
      return;
    }

    setFetchingLostAccountInfos(true);
    checkLostAccountBalance();
    checkLostAccountSoloStakedBalance();
    checkLostAccountClaimedStatus();
    checkLostAccountPoolStakedBalance();
    checkLostAccountIdentity();
  }, [activeProxy, sessionInfo, lostAccountRecoveryInfo, api, checkLostAccountBalance, checkLostAccountIdentity, checkLostAccountPoolStakedBalance, accountsInfo, checkLostAccountClaimedStatus, checkLostAccountSoloStakedBalance, fetchingLostAccountInfos, formatted, isDelayPassed, mode, setWithdrawInfo, withdrawInfo, lostAccount?.address]);

  useEffect(() => {
    if (!lostAccount?.address || !formatted || lostAccountPoolStakingBalance === undefined || lostAccountSoloUnlock === undefined || lostAccountIdentity === undefined || lostAccountBalance === undefined || lostAccountReserved === undefined || lostAccountRedeemable === undefined || lostAccountSoloStakingBalance === undefined || alreadyClaimed === undefined) {
      return;
    }

    setFetchingLostAccountInfos(false);

    setWithdrawInfo({
      availableBalance: lostAccountBalance,
      claimed: alreadyClaimed,
      hasId: lostAccountIdentity,
      isRecoverable: !!lostAccountRecoveryInfo,
      lost: lostAccount.address,
      poolStaked: lostAccountPoolStakingBalance,
      redeemable: lostAccountRedeemable,
      rescuer: formatted,
      reserved: lostAccountReserved,
      soloStaked: lostAccountSoloStakingBalance,
      soloUnlock: lostAccountSoloUnlock
    });
  }, [alreadyClaimed, formatted, lostAccount?.address, lostAccountSoloUnlock, lostAccountIdentity, lostAccountPoolStakingBalance, lostAccountReserved, lostAccountBalance, lostAccountRecoveryInfo, lostAccountRedeemable, lostAccountSoloStakingBalance, setWithdrawInfo]);

  useEffect(() => {
    if (withdrawInfo && goReview) {
      setStep(STEPS.REVIEW);
    }
  }, [goReview, setStep, withdrawInfo]);

  const selectLostAccount = useCallback((addr: FriendWithId | undefined) => {
    setLostAccount(addr);
  }, []);

  const goBack = useCallback(() => {
    setStep(STEPS.INDEX);
    setMode(undefined);
  }, [setMode, setStep]);

  const rescueLostAccount = useCallback(() => {
    setLostAccountAddress({
      accountIdentity: lostAccount?.accountIdentity,
      address: lostAccount?.address ?? '',
      delayPeriod: lostAccountRecoveryInfo ? recoveryDelayPeriod(lostAccountRecoveryInfo.delayPeriod.toNumber(), 1) : '0',
      friends: {
        addresses: lostAccountRecoveryInfo ? lostAccountRecoveryInfo.friends.map((friend) => String(friend)) : [],
        infos: lostAccountRecoveryInfo ? lostAccountRecoveryInfo.friends.map((friend) => accountsInfo?.find((accInfo) => String(accInfo.accountId) === String(friend))) : []
      },
      threshold: lostAccountRecoveryInfo ? lostAccountRecoveryInfo.threshold.toNumber() : 0
    });
    setTotalDeposit(recoveryDeposit);
    setMode('InitiateRecovery');
    setStep(STEPS.REVIEW);
  }, [accountsInfo, lostAccount?.accountIdentity, lostAccount?.address, lostAccountRecoveryInfo, recoveryDeposit, setLostAccountAddress, setMode, setStep, setTotalDeposit]);

  const goWithdraw = useCallback(() => {
    setLostAccountAddress({
      accountIdentity: lostAccount?.accountIdentity,
      address: lostAccount?.address ?? ''
    });
    setMode('Withdraw');
    setGoReview(true);
  }, [lostAccount, setLostAccountAddress, setMode]);

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      {initiatedRecovery || activeProxy
        ? <>
          <Grid alignItems='center' container item pt='20px' width='fit-content'>
            <Box
              component='img'
              src={theme.palette.mode === 'dark'
                ? socialRecoveryDark as string
                : socialRecoveryLight as string}
              sx={{ height: '66px', width: '66px' }}
            />
            <Typography fontSize='30px' fontWeight={700} pl='15px'>
              {t<string>('Social Recovery')}
            </Typography>
          </Grid>
          {initiatedRecovery
            ? <InitiatedRecoveryStatus
              api={api}
              chain={chain}
              delayRemainBlock={Math.max(0, delayEndBlock - (currentBlockNumber ?? 0))}
              goWithdraw={goWithdraw}
              initiatedRecovery={initiatedRecovery}
              isDelayPassed={isDelayPassed}
              isVouchedCompleted={isVouchedCompleted}
              lostAccountRecoveryInfo={lostAccountRecoveryInfo}
            />
            : <ActiveProxyStatus
              api={api}
              withdrawInfo={withdrawInfo}
            />}
        </>
        : <>
          <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
            {t<string>('Initiate Recovery')}
          </Typography>
          <Typography fontSize='14px' fontWeight={400} width='100%'>
            {t<string>('The account recovery process for a lost account must be initiated by a rescuer through a token deposit.')}
          </Typography>
          <Typography fontSize='22px' fontWeight={700} pt='10px' width='100%'>
            {t<string>('Step 1/2: Confirm lost account ')}
          </Typography>
          <SelectTrustedFriend
            accountsInfo={accountsInfo}
            api={api}
            chain={chain}
            disabled={false}
            helperText='ToDo'
            iconType='none'
            label={t<string>('Lost accounts')}
            onSelectFriend={selectLostAccount}
            placeHolder={t<string>('Enter account ID or address')}
            style={{ py: '15px', width: '100%' }}
          />
          {lostAccountRecoveryInfo !== false &&
            <Grid container item justifyContent='flex-end' pt='15px' sx={{ '> button': { width: '190px' }, '> div': { width: '190px' } }}>
              <PButton
                _isBusy={lostAccountRecoveryInfo === undefined}
                _ml={0}
                _mt='0'
                _onClick={checkLostAccountRecoverability}
                disabled={!lostAccount}
                text={t<string>('Verify status')}
              />
            </Grid>
          }
          {lostAccountRecoveryInfo !== false &&
            <LostAccountRecoveryInfo
              accountsInfo={accountsInfo}
              decimal={decimal}
              lostAccountRecoveryInfo={lostAccountRecoveryInfo}
              token={token}
            />
          }
        </>
      }
      <Grid container item justifyContent='flex-end' pt='15px'>
        <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
          <TwoButtons
            disabled={nextBtnDisable}
            isBusy={mode === 'Withdraw' && !withdrawInfo}
            mt={'1px'}
            onPrimaryClick={initiatedRecovery || activeProxy
              ? goWithdraw
              : lostAccountRecoveryInfo === false
                ? checkLostAccountRecoverability
                : rescueLostAccount}
            onSecondaryClick={goBack}
            primaryBtnText={initiatedRecovery || activeProxy
              ? t<string>('Withdraw')
              : lostAccountRecoveryInfo === false
                ? t<string>('Verify status')
                : t<string>('Proceed')}
            secondaryBtnText={t<string>('Back')}
            variant='text'
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
