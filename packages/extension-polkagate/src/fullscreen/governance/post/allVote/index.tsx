// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import React, { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { useApi, useChainName } from '../../../../hooks';
import { AbstainVoteType, AllVotesType, FilteredVotes, getAllVotesFromPA, VoteType } from '../../utils/helpers';
import { getAddressVote } from '../myVote/util';
import Delegators from './Delegators';
import FellowshipVotes from './FellowshipVotes';
import Standards from './Standards';

interface Props {
  address: string | undefined;
  isFellowship: boolean | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void
  refIndex: number | undefined;
  trackId: number | undefined;
  setVoteCountsPA: React.Dispatch<React.SetStateAction<{
    ayes: number | undefined;
    nays: number | undefined;
  } | undefined>>;
}

export const VOTE_PER_PAGE = 10;

export const VOTE_TYPE_MAP = {
  AYE: 1,
  NAY: 2,
  ABSTAIN: 3
};

export const getVoteValue = (vote: AbstainVoteType | VoteType, voteTypeStr?: 'abstain' | 'other' | 'capital'): BN => {
  voteTypeStr = voteTypeStr || ('abstain' in vote.balance ? 'abstain' : 'other');

  const value = voteTypeStr === 'abstain'
    ? vote.balance.abstain || new BN(vote.balance.aye).add(new BN(vote.balance.nay))
    : vote.lockPeriod === 0
      ? new BN(vote.balance.value).div(new BN(10))
      : new BN(vote.balance.value).muln(vote.lockPeriod || 1);

  return new BN(value);
};

export const getVoteCapital = (vote: VoteType | AbstainVoteType) => {
  let voteTypeStr = 'abstain' in vote.balance ? 'abstain' : 'other';

  const value = voteTypeStr === 'abstain'
    ? vote.balance.abstain || new BN(vote.balance.aye).add(new BN(vote.balance.nay))
    : new BN(vote.balance.value);

  return new BN(value);
};

export default function AllVotes({ address, isFellowship, open, refIndex, setOpen, setVoteCountsPA, trackId }: Props): React.ReactElement {
  const chainName = useChainName(address);
  const api = useApi(address);
  const [allVotes, setAllVotes] = useState<AllVotesType | null>();
  const [showDelegatorsOf, setShowDelegators] = useState<VoteType | AbstainVoteType | null>();
  const [filteredVotes, setFilteredVotes] = useState<FilteredVotes | null>();
  // const [numberOfFetchedDelagatees, setNumberOfFetchedDelagatees] = useState<number>(0);
  const [standardPage, setStandardPage] = useState<number>(1);

  useEffect(() => {
    if (!chainName || refIndex === undefined || isFellowship === undefined || setVoteCountsPA === undefined) {
      return;
    }

    getAllVotesFromPA(chainName, refIndex, 100, isFellowship).then((res: AllVotesType | null) => {
      if (!res?.yes && !res?.abstain && !res?.no) {
        return setAllVotes(null);
      }

      const maxVote = Math.max(res.abstain.count, res.no.count, res.yes.count);

      getAllVotesFromPA(chainName, refIndex, maxVote, isFellowship).then((res: AllVotesType | null) => {
        if (!res) {
          return setAllVotes(null);
        }

        // console.log('All votes from PA:', res);

        setAllVotes(res); // TODO: need to work on onchain case as well to make this robust
        setFilteredVotes({
          abstain: res.abstain.votes.filter((v) => !v.isDelegated),
          no: res.no.votes.filter((v) => !v.isDelegated),
          yes: res.yes.votes.filter((v) => !v.isDelegated)
        });
        setVoteCountsPA({ ayes: res?.yes?.count, nays: res?.no?.count });
      }).catch(console.error);
    }).catch(console.error);
  }, [chainName, isFellowship, refIndex, setVoteCountsPA]);

  // useEffect(() => {
  //   if (!allVotes || !api || !trackId || !refIndex) {
  //     return;
  //   }

  //   const keys = Object.keys(allVotes);

  //   console.log('allVotesallVotesallVotes:', allVotes);

  //   keys.map((key) =>
  //     allVotes[key as keyof AllVotesType].votes.map((v) => {
  //       // if (v.delegatedVotingPower !== '0') {
  //         getAddressVote(String(v.voter), api, Number(refIndex), Number(trackId)).then((delegatedVoteInfo) => {
  //           if (delegatedVoteInfo) {
  //             v.delegatee = delegatedVoteInfo.delegating?.target;
  //             console.log('delegatedVoteInfo.delegating:', delegatedVoteInfo);

  //             setAllVotes({ ...allVotes });
  //             setNumberOfFetchedDelagatees((prev) => prev + 1);
  //           }
  //         }).catch(console.error);
  //       // }

  //       return v;
  //     })
  //   );
  // }, [allVotes?.yes?.votes?.length, allVotes?.abstain?.votes?.length, allVotes?.no?.votes?.length, api, refIndex, trackId]);

  const handleClose = useCallback(() => {
    allVotes && setFilteredVotes({
      abstain: allVotes.abstain.votes.filter((v) => !v.isDelegated),
      no: allVotes.no.votes.filter((v) => !v.isDelegated),
      yes: allVotes.yes.votes.filter((v) => !v.isDelegated)
    });
    setOpen(false);
  }, [allVotes, setFilteredVotes, setOpen]);

  return (
    <>
      {!showDelegatorsOf
        ? isFellowship
          ? <FellowshipVotes
            address={address}
            allVotes={allVotes}
            filteredVotes={filteredVotes}
            handleClose={handleClose}
            open={open}
            page={standardPage}
            setFilteredVotes={setFilteredVotes}
            setPage={setStandardPage}
          />
          : <Standards
            address={address}
            allVotes={allVotes}
            filteredVotes={filteredVotes}
            handleClose={handleClose}
            open={open}
            page={standardPage}
            setFilteredVotes={setFilteredVotes}
            setPage={setStandardPage}
            setShowDelegators={setShowDelegators}
          />
        : <Delegators
          address={address}
          closeDelegators={() => setShowDelegators(null)}
          handleCloseStandards={handleClose}
          open={!!showDelegatorsOf}
          standard={showDelegatorsOf}
        />
      }
    </>
  );
}
