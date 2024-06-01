// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletRecoveryRecoveryConfig, PalletReferendaReferendumInfoRankedCollectiveTally, PalletReferendaReferendumStatusRankedCollectiveTally, PalletSocietyBid, PalletSocietyCandidacy } from '@polkadot/types/lookup';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Option } from '@polkadot/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { Proxy } from '../,,/../util/types';
import { PROXY_CHAINS } from '../util/constants';
import useActiveRecoveries from './useActiveRecoveries';
import { useInfo } from '.';

type Item = 'identity' | 'proxy' | 'bounty' | 'recovery' | 'referenda' | 'index' | 'society';
export type Reserved = { [key in Item]?: Balance };

export default function useReservedDetails (address: string | undefined): Reserved {
  const { api, formatted, genesisHash } = useInfo(address);
  const activeRecoveries = useActiveRecoveries(api);
  const [reserved, setReserved] = useState<Reserved>({});

  const activeLost = useMemo(() =>
    activeRecoveries && formatted
      ? activeRecoveries.filter((active) => active.lost === String(formatted)).at(-1) ?? null
      : activeRecoveries === null
        ? null
        : undefined
  , [activeRecoveries, formatted]);

  const toBalance = useCallback((value: BN) => {
    if (!api) {
      return undefined;
    }

    return api.createType('Balance', value);
  }, [api]);

  useEffect(() => {
    if (!api || !genesisHash) {
      return;
    }

    // TODO: needs to incorporate people chain
    /** fetch identity reserved */
    api.query?.identity?.identityOf(formatted).then((id) => {
      const basicDeposit = api.consts.identity.basicDeposit;

      !id.isEmpty && setReserved((prev) => {
        prev.identity = toBalance(basicDeposit as unknown as BN);

        return prev;
      });
    }).catch(console.error);

    /** fetch proxy reserved */
    if (api.query?.proxy && PROXY_CHAINS.includes(genesisHash)) {
      const proxyDepositBase = api.consts.proxy.proxyDepositBase as unknown as BN;
      const proxyDepositFactor = api.consts.proxy.proxyDepositFactor as unknown as BN;

      api.query.proxy.proxies(formatted).then((p) => {
        const fetchedProxies = JSON.parse(JSON.stringify(p[0])) as unknown as Proxy[];
        const proxyCount = fetchedProxies.length;

        if (proxyCount > 0) {
          setReserved((prev) => {
            prev.proxy = toBalance(proxyDepositBase.add(proxyDepositFactor.muln(proxyCount)));

            return prev;
          });
        }
      }).catch(console.error);
    }

    /** fetch social recovery reserved */
    api?.query?.recovery && api.query.recovery.recoverable(formatted).then((r) => {
      const recoveryInfo = r.isSome ? r.unwrap() as unknown as PalletRecoveryRecoveryConfig : null;

      recoveryInfo?.deposit && setReserved((prev) => {
        prev.recovery = toBalance((recoveryInfo.deposit as unknown as BN).add(activeLost?.deposit as unknown as BN || BN_ZERO));

        return prev;
      });
    }).catch(console.error);

    /** Fetch referenda reserved */
    if (api.query?.referenda?.referendumInfoFor) {
      let referendaDepositSum = BN_ZERO;

      api.query.referenda.referendumInfoFor.entries().then((referenda) => {
        referenda.forEach(([_, value]) => {
          if (value.isSome) {
            const ref = (value.unwrap()) as PalletReferendaReferendumInfoRankedCollectiveTally | undefined;

            if (!ref) {
              return;
            }

            const info = (ref.isCancelled
              ? ref.asCancelled
              : ref.isRejected
                ? ref.asRejected
                : ref.isOngoing
                  ? ref.asOngoing
                  : ref.isApproved ? ref.asApproved : undefined) as PalletReferendaReferendumStatusRankedCollectiveTally | undefined;

            if (info?.submissionDeposit && info.submissionDeposit.who.toString() === formatted) {
              referendaDepositSum = referendaDepositSum.add(info.submissionDeposit.amount);
            }

            if (info?.decisionDeposit?.isSome) {
              const decisionDeposit = info?.decisionDeposit.unwrap();

              if (decisionDeposit.who.toString() === formatted) {
                referendaDepositSum = referendaDepositSum.add(decisionDeposit.amount);
              }
            }
          }
        });

        if (!referendaDepositSum.isZero()) {
          setReserved((prev) => {
            prev.referenda = toBalance(referendaDepositSum);

            return prev;
          });
        }
      }).catch(console.error);
    }

    /** Fetch bounties reserved */
    if (api.query?.bounties?.bounties) {
      let sum = BN_ZERO;

      api.query.bounties.bounties.entries().then((bounties) => {
        bounties.forEach(([_, value]) => {
          if (value.isSome) {
            const bounty = (value.unwrap());

            if (bounty.proposer.toString() === formatted) {
              sum = sum.add(bounty.curatorDeposit);
            }
          }
        });

        if (!sum.isZero()) {
          setReserved((prev) => {
            prev.bounty = toBalance(sum);

            return prev;
          });
        }
      }).catch(console.error);
    }

    /** Fetch indices reserved */
    if (api.query?.indices) {
      let sum = BN_ZERO;

      api.query.indices.accounts.entries().then((indices) => {
        indices.forEach(([_, value]) => {
          if (value.isSome) {
            const [address, deposit, _status] = value.unwrap() as [ AccountId, BN, boolean ];

            if (address.toString() === formatted) {
              sum = sum.add(deposit);
            }
          }
        });

        if (!sum.isZero()) {
          setReserved((prev) => {
            prev.index = toBalance(sum);

            return prev;
          });
        }
      }).catch(console.error);
    }

    /** Fetch society reserved */
    if (api.query?.society) {
      let sum = BN_ZERO;

      api.query.society.bids().then(async (bids) => {
        (bids as unknown as PalletSocietyBid[]).forEach(({ _value, kind, who }) => {
          if (who.toString() === formatted) {
            const deposit = kind.isDeposit ? kind.asDeposit : BN_ZERO;

            sum = sum.add(deposit);
          }
        });

        const candidates = await api.query.society.candidates(formatted) as Option<PalletSocietyCandidacy>;

        if (candidates.isSome) {
          const { kind } = candidates.unwrap();
          const deposit = kind.isDeposit ? kind.asDeposit : BN_ZERO;

          sum = sum.add(deposit);
        }

        if (!sum.isZero()) {
          setReserved((prev) => {
            prev.society = toBalance(sum);

            return prev;
          });
        }
      }).catch(console.error);
    }
  }, [activeLost?.deposit, api, formatted, genesisHash, toBalance]);

  useEffect(() => {
    setReserved({});
  }, [activeLost?.deposit, api, formatted, genesisHash]);

  return reserved;
}
