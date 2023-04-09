// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { AccountBalance as TreasuryIcon, AdminPanelSettings as AdminsIcon, BorderAll as All, Cancel, Close, Groups as FellowshipIcon, HowToVote as ReferendaIcon, Hub as Root, ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import { Box, Breadcrumbs, Button, Container, Divider, Grid, LinearProgress, Link, Typography, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { DeriveTreasuryProposals } from '@polkadot/api-derive/types';
import { BN, BN_MILLION, BN_ZERO, u8aConcat } from '@polkadot/util';

import { logoBlack, logoWhite } from '../../assets/logos';
import { FormatPrice, Identity, InputFilter, ShowBalance, ShowValue } from '../../components';
import { useApi, useChain, useChainName, useDecidingCount, useDecimal, usePrice, useToken, useTracks, useTranslation } from '../../hooks';
import { ChainSwitch } from '../../partials';
import { remainingTime } from '../../util/utils';
import { getLatestReferendums, getReferendumStatistics, getReferendumVotes, getTrackReferendums, Statistics } from './helpers';
import ReferendaMenu from './ReferendaMenu';

const STATUS_COLOR = {
  Canceled: '#ff4f4f', // Status color for Canceled proposals (red)
  Confirmed: '#2ecc71', // Status color for Confirmed proposals (green)
  Deciding: '#3498db', // Status color for Deciding proposals (blue)
  Executed: '#9b59b6', // Status color for Executed proposals (purple)
  Rejected: '#f39c12', // Status color for Rejected proposals (orange)
  Submitted: '#bdc3c7', // Status color for Submitted proposals (gray)
  TimedOut: '#7f8c8d', // Status color for TimedOut proposals (gray)
};

type TopMenu = 'Referenda' | 'Fellowship';
const EMPTY_U8A_32 = new Uint8Array(32);

export default function Governance(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const api = useApi(address);
  const chain = useChain(address);
  const tracks = useTracks(address, api);
  const price = usePrice(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const chainName = useChainName(address);

  const decidingCounts = useDecidingCount(api, tracks);
  console.log('decidingCounts:', decidingCounts)
  const [selectedTopMenu, setSelectedTopMenu] = useState<TopMenu>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>('All');

  const [proposals, setProposals] = useState<DeriveTreasuryProposals | undefined>();
  const [activeProposalCount, setActiveProposalCount] = useState<number | undefined>();
  const [availableTreasuryBalance, setAvailableTreasuryBalance] = useState<BN | undefined>();
  const [spendPeriod, setSpendPeriod] = useState<BN | undefined>();
  const [remainingSpendPeriod, setRemainingSpendPeriod] = useState<BN | undefined>();
  const [remainingTimeToSpend, setRemainingTimeToSpend] = useState<string | undefined>();
  const [remainingSpendPeriodPercent, setRemainingSpendPeriodPercent] = useState<number | undefined>();
  const [pendingBounties, setPendingBounties] = useState<BN | undefined>();
  const [pendingProposals, setPendingProposals] = useState<BN | undefined>();
  const [spendable, setSpendable] = useState<BN | undefined>();
  const [spenablePercent, setSpendablePercent] = useState<number | undefined>();
  const [nextBurn, setNextBurn] = useState<BN | undefined>();
  const [referendumCount, setReferendumCount] = useState<number | undefined>();
  const [referendumStats, setReferendumStats] = useState<Statistics | undefined>();
  const [approved, setApproved] = useState<BN | undefined>();
  const [referendaToList, setReferenda] = useState<string[]>();

  useEffect(() => {
    if (!api) {
      return;
    }

    let cancel = false;

    // clear proposals state
    setProposals(undefined);

    // fetch proposals
    api.derive.treasury.proposals()?.then((p) => {
      if (!cancel) {
        setProposals(p);
        setActiveProposalCount(p?.proposals.length + p?.approvals.length);
        // console.log('proposals:', JSON.stringify(p?.proposals));
      }
    }).catch(console.error);

    return () => {
      cancel = true;
    };
  }, [api]);

  useEffect(() => {
    /** To fetch treasury info */
    async function fetchData() {
      try {
        if (!api) {
          return;
        }

        const treasuryAccount = u8aConcat(
          'modl',
          api.consts.treasury && api.consts.treasury.palletId
            ? api.consts.treasury.palletId.toU8a(true)
            : 'py/trsry',
          EMPTY_U8A_32
        ).subarray(0, 32);

        const [bestNumber, bounties, treasuryProposals, account] = await Promise.all([
          api.derive.chain.bestNumber(),
          api.derive.bounties?.bounties(),
          api.derive.treasury?.proposals(),
          api.derive.balances?.account(treasuryAccount)
        ]);

        const spendPeriod = new BN(api.consts.treasury?.spendPeriod) ?? BN_ZERO;
        const remainingSpendPeriod = spendPeriod.sub(bestNumber.mod(spendPeriod));
        const treasuryBalance = account ? account.freeBalance : BN_ZERO;
        const pendingBounties = bounties
          ? bounties.reduce((total, { bounty: { status, value } }) =>
            total.iadd(status.isApproved ? value : BN_ZERO), new BN(0))
          : BN_ZERO;
        const pendingProposals = treasuryProposals
          ? treasuryProposals.approvals.reduce((total, { proposal: { value } }) => total.iadd(value), new BN(0))
          : BN_ZERO;

        const approved = pendingBounties.add(pendingProposals);
        const spendable = treasuryBalance.sub(approved);
        const rt = remainingTime(remainingSpendPeriod.toNumber(), true);
        const nextBurn = api.consts.treasury.burn.mul(treasuryBalance).div(BN_MILLION) as BN;

        setRemainingSpendPeriod(remainingSpendPeriod);
        setSpendPeriod(spendPeriod.divn(24 * 60 * 10));
        setRemainingTimeToSpend(rt);
        setRemainingSpendPeriodPercent(spendPeriod.sub(remainingSpendPeriod).muln(100).div(spendPeriod).toNumber());
        setAvailableTreasuryBalance(treasuryBalance);
        setNextBurn(nextBurn);
        setPendingBounties(pendingBounties);
        setPendingProposals(pendingProposals);
        setApproved(approved);
        setSpendable(spendable);
        setSpendablePercent(spendable.muln(100).div(treasuryBalance).toNumber());
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [api]);

  useEffect(() => {
    console.log('*******************************************************');
    chainName && getReferendumVotes(chainName, 124);
  }, [chainName]);

  useEffect(() => {
    if (!api) {
      return;
    }

    if (!api.consts.referenda || !api.query.referenda) {
      console.log('OpenGov is not supported on this chain');

      return;
    }

    console.log('Maximum size of the referendum queue for a single track:', api.consts.referenda.maxQueued.toString());
    console.log('minimum amount to be used as a deposit :', api.consts.referenda.submissionDeposit.toString());
    console.log('blocks after submission that a referendum must begin decided by.', api.consts.referenda.undecidingTimeout.toString());

    api.query.referenda.referendumCount().then((count) => {
      console.log('total referendum count:', count.toNumber());
      setReferendumCount(count?.toNumber());

      const latestReferendumNumber = count.toNumber() - 2;
      api.query.referenda.referendumInfoFor(latestReferendumNumber).then((res) => {
        console.log(`referendumInfoFor referendum ${latestReferendumNumber} :, ${res}`);
      });
    }).catch(console.error);

    const trackId_mediumSpender = 33;

    api.query.referenda.decidingCount(trackId_mediumSpender).then((res) => {
      console.log('total referendum being decided in trackId_mediumSpender:', res.toString());
    }).catch(console.error);

    api.query.referenda.trackQueue(trackId_mediumSpender).then((res) => {
      console.log('trackQueue for trackId_mediumSpender:', res.toString());
    }).catch(console.error);
  }, [api]);

  useEffect(() => {
    chainName && getLatestReferendums(chainName).then((res) => {
      setReferenda(res);
    });
  }, [chainName]);

  useEffect(() => {
    chainName && getReferendumStatistics(chainName).then((stat) => {
      setReferendumStats(stat);
    });
  }, [chainName]);

  useEffect(() => {
    if (chainName && selectedSubMenu && selectedSubMenu !== 'All' && tracks) {
      const trackId = tracks.find((t) => t[1].name === selectedSubMenu.toLowerCase().replace(' ', '_'))?.[0];
      console.log('selectedSubMenu:', selectedSubMenu)
      console.log('trackId:', trackId)
      trackId !== undefined && getTrackReferendums(chainName, trackId).then((res) => {
        setReferenda(res);
      }).catch(console.error);
    }
  }, [chainName, selectedSubMenu, tracks]);

  useEffect(() => {
    /** to change app width to full screen */
    const root = document.getElementById('root');

    if (root) {
      root.style.width = '100%';
    }

    return () => {
      if (root) {
        root.style.width = '';
      }
    };
  }, []);

  const onTopMenuMenuClick = useCallback((item: TopMenu) => {
    setSelectedTopMenu(item);
    setMenuOpen(!menuOpen);
  }, [menuOpen]);

  function TopMenu({ item }: { item: TopMenu }): React.ReactElement<{ item: TopMenu }> {
    return (
      <Grid alignItems='center' container item justifyContent='center' onClick={() => onTopMenuMenuClick(item)} sx={{ mt: '3px', px: '5px', bgcolor: selectedTopMenu === item ? 'background.paper' : 'primary.main', color: selectedTopMenu === item ? 'primary.main' : 'text.secondary', width: '150px', height: '48px', cursor: 'pointer' }}>
        <Typography sx={{ display: 'inline-block', fontWeight: 500, fontSize: '20px' }}>
          {item}
        </Typography>
        {item === 'Fellowship'
          ? <FellowshipIcon sx={{ fontSize: 29, ml: '10px' }} />
          : <ReferendaIcon sx={{ fontSize: 29, ml: '10px', transform: 'scaleX(-1)' }} />
        }
      </Grid>
    );
  }

  const SearchBar = () => (
    <Grid alignItems='center' container pt='25px'>
      <Grid item justifyContent='flex-start' xs>
        <InputFilter
          autoFocus={false}
          // onChange={onSearch}
          placeholder={t<string>('🔍 Search ')}
          theme={theme}
        // value={searchKeyword ?? ''}
        />
      </Grid>
      <Grid alignItems='center' container fontSize='16px' fontWeight={400} item justifyContent='flex-start'
        // onClick={onFilters}
        pl='15px' py='10px' xs={1} sx={{ cursor: 'pointer' }}>
        {t('Filters')}
        <Grid alignItems='center' container item justifyContent='center' pl='10px' sx={{ cursor: 'pointer', width: '40%' }}>
          <vaadin-icon icon='vaadin:ellipsis-dots-v' style={{ color: `${theme.palette.secondary.light}`, width: '33px' }} />
        </Grid>
      </Grid>
    </Grid>
  );

  const AllReferendaSummary = () => (
    <Grid alignItems='start' justifyContent='space-between' container sx={{ bgcolor: 'background.paper', borderRadius: '10px', height: '165px', pt: '15px', pb: '20px' }}>
      <Grid container item xs={2.5} sx={{ mx: '3%' }}>
        <Grid item xs={12} sx={{ borderBottom: '2px solid gray', mb: '10px' }}>
          <Typography fontSize={20} fontWeight={500}>
            {t('Referenda stats')}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-between' md={12} my='2px' height='26px' >
          <Grid item sx={{ height: '25px' }}>
            <Typography fontWeight={400}>
              {t('Confirming')}
            </Typography>
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 500 }} >
            <ShowValue value={referendumStats?.confirm_total} />              </Grid>
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-between' md={12} my='2px' height='26px'>
          <Grid item sx={{ height: '25px' }}>
            <Typography fontWeight={400}>
              {t('Deciding')}
            </Typography>
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 500 }} >
            <ShowValue value={referendumStats?.voting_total} />
          </Grid>
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-between' md={12} my='2px' height='26px'>
          <Grid item sx={{ height: '25px' }}>
            <Typography fontWeight={400}>
              {t('Participation')}
            </Typography>
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
            <ShowBalance api={api} balance={referendumStats?.referendum_participate} decimal={decimal} decimalPoint={2} token={token} />
          </Grid>
        </Grid>
        <Divider orientation='vertical' />
      </Grid>
      <Grid container item xs={8.5} sx={{ pr: '3%' }}>
        <Grid item xs={12} sx={{ borderBottom: '2px solid gray', mb: '10px' }}>
          <Typography fontSize={20} fontWeight={500}>
            {t('Treasury stats')}
          </Typography>
        </Grid>
        <Grid container item xs={2.5} pr='3%'>
          <Grid item md={12} sx={{ height: '25px' }}>
            <Typography fontWeight={400}>
              {t('Available')}
            </Typography>
          </Grid>
          <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', fontSize: '20px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em' }} xs={12}>
            <ShowBalance api={api} balance={availableTreasuryBalance} decimalPoint={2} />
          </Grid>
          <Grid item sx={{ fontSize: '18px', pt: '8px', letterSpacing: '-0.015em', height: '36px' }} xs={12}>
            <FormatPrice
              amount={availableTreasuryBalance}
              decimals={decimal}
              price={price?.amount}
            />
          </Grid>
        </Grid>
        <Divider flexItem orientation='vertical' />
        <Grid container item sx={{ px: '3%' }} xs={2.5}>
          <Grid item md={12} sx={{ height: '25px' }}>
            <Typography fontWeight={400}>
              {t('Approved')}
            </Typography>
          </Grid>
          <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', fontSize: '20px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em' }} xs={12}>
            <ShowBalance api={api} balance={approved} decimalPoint={2} />
          </Grid>
          <Grid item sx={{ fontSize: '18px', pt: '8px', letterSpacing: '-0.015em', height: '36px' }} xs={12}>
            <FormatPrice
              amount={approved}
              decimals={decimal}
              price={price?.amount}
            />
          </Grid>
        </Grid>
        <Divider flexItem orientation='vertical' />
        <Grid container item sx={{ px: '3%' }} xs={4}>
          <Grid item md={12} sx={{ height: '25px' }}>
            <Typography fontWeight={400}>
              {t('Spend Period')}
            </Typography>
          </Grid>
          <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', fontSize: '20px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em' }} xs={12}>
            <ShowValue value={remainingTimeToSpend} /> / <ShowValue value={spendPeriod?.toString()} width='20px' /> {t('days')}
          </Grid>
          <Grid alignItems='center' container item sx={{ fontSize: '18px', height: '36px', letterSpacing: '-0.015em', pt: '8px' }} xs={12}>
            <Grid item xs>
              <LinearProgress sx={{ bgcolor: 'primary.contrastText', mt: '10px' }} value={remainingSpendPeriodPercent || 0} variant='determinate' />
            </Grid>
            <Grid item sx={{ textAlign: 'right' }} xs={2}>
              {remainingSpendPeriodPercent}%
            </Grid>
          </Grid>
        </Grid>
        <Divider flexItem orientation='vertical' />
        <Grid container item sx={{ pl: '3%' }} xs={2.5}>
          <Grid item md={12} sx={{ height: '25px' }}>
            <Typography fontWeight={400}>
              {t('Next Burn')}
            </Typography>
          </Grid>
          <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', fontSize: '20px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em' }} xs={12}>
            <ShowBalance api={api} balance={nextBurn} decimalPoint={2} />
          </Grid>
          <Grid item sx={{ fontSize: '18px', pt: '8px', letterSpacing: '-0.015em', height: '36px' }} xs={12}>
            <FormatPrice
              amount={nextBurn}
              decimals={decimal}
              price={price?.amount}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <>
      <Grid alignItems='center' container id='header' justifyContent='space-between' sx={{ px: '2%', bgcolor: '#180710', height: '70px', color: 'text.secondary', fontSize: '42px', fontWeight: 400, fontFamily: 'Eras' }}>
        <Grid alignItems='center' container item justifyContent='flex-start' xs={6}>
          <Box
            component='img'
            src={theme.palette.mode === 'light' ? logoBlack as string : logoWhite as string}
            sx={{ height: 50, mr: '1%', width: 50 }}
          />
          Polkagate
        </Grid>
        <Grid container item justifyContent='flex-end' xs={6}>
          <ChainSwitch address={address} />
        </Grid>
      </Grid>
      <Grid alignItems='center' container id='menu' justifyContent='space-between' sx={{ bgcolor: 'primary.main', height: '51.5px', color: 'text.secondary', fontSize: '20px', fontWeight: 500, pl: '2%' }}>
        <Grid alignItems='flex-end' container item justifyContent='flex-start' md={4}>
          <TopMenu item={'Referenda'} />
          <TopMenu item={'Fellowship'} />
        </Grid>
        <Grid container item justifyContent='flex-end' md={5} sx={{ pr: '2%' }}>
          <Button
            // disabled={disabled}
            // onClick={_onClick}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '5px',
              color: 'primary.main',
              fontSize: '18px',
              fontWeight: 500,
              height: '36px',
              textTransform: 'none',
              width: '208px',
              '&:hover': {
                backgroundColor: '#fff',
                color: '#3c52b2'
              }
            }}
            variant='contained'
          >
            Multirole Delegate
          </Button>
          <Button
            // disabled={disabled}
            // onClick={_onClick}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '5px',
              color: 'primary.main',
              fontSize: '18px',
              fontWeight: 500,
              height: '36px',
              textTransform: 'none',
              ml: '15px',
              width: '208px',
              '&:hover': {
                backgroundColor: '#fff',
                color: '#3c52b2'
              }
            }}
            variant='contained'
          >
            Submit Referendum
          </Button>
        </Grid>
      </Grid>
      {menuOpen && selectedTopMenu === 'Referenda' &&
        <ReferendaMenu decidingCounts={decidingCounts} setSelectedSubMenu={setSelectedSubMenu} setMenuOpen={setMenuOpen} />
      }
      <Container disableGutters maxWidth={false} sx={{ opacity: menuOpen && 0.3, px: '2%', top: 122, position: 'fixed', maxHeight: parent.innerHeight - 140, overflowY: 'scroll' }}>
        <Grid container sx={{ py: '10px', fontWeight: 500 }}>
          <Breadcrumbs aria-label='breadcrumb' color='text.primary'>
            <Link href='#' underline='hover'>
              {selectedTopMenu || 'Referenda'}
            </Link>
            <Typography color='text.primary'>{selectedSubMenu || 'All'}</Typography>
          </Breadcrumbs>
        </Grid>
        <AllReferendaSummary />
        <SearchBar />
        {referendaToList
          ? <>
            {referendaToList.map((referendum, index) => {
              if (referendum.post_id < (referendumCount || referendumStats?.OriginsCount)) {
                return (
                  <Grid item key={index} sx={{ borderRadius: '10px', bgcolor: 'background.paper', height: '137px', pt: '30px', pb: '20px', my: '13px', px: '20px' }}>
                    <Grid item sx={{ pb: '15px', fontSize: 20, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {`#${referendum.post_id}  ${referendum.title || t('No title yet')}`}
                    </Grid>
                    <Grid alignItems='center' container item justifyContent='space-between'>
                      <Grid alignItems='center' container item xs={10}>
                        <Grid item sx={{ fontSize: '16px', fontWeight: 400, mr: '17px' }}>
                          {t('By')}:
                        </Grid>
                        <Grid item sx={{ mb: '10px' }}>
                          <Identity
                            api={api}
                            chain={chain}
                            formatted={referendum.proposer}
                            identiconSize={25}
                            showSocial={false}
                            style={{
                              height: '38px',
                              maxWidth: '100%',
                              minWidth: '35%',
                              width: 'fit-content',
                              fontSize: '16px',
                              fontWeight: 400,
                              lineHeight: '47px'
                            }}
                          />
                        </Grid>
                        <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
                        <Grid item sx={{ bgcolor: 'background.default', border: `1px solid ${theme.palette.primary.main}`, borderRadius: '30px', fontSize: '16px', fontWeight: 400, p: '6.5px 14.5px' }}>
                          {referendum.origin.replace(/([A-Z])/g, ' $1').trim()}
                        </Grid>
                        <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
                        <Grid item sx={{ fontSize: '16px', fontWeight: 400, opacity: 0.6 }}>
                          {referendum.method}
                        </Grid>
                        <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
                        <ClockIcon sx={{ fontSize: 28, ml: '10px' }} />
                        <Grid item sx={{ fontSize: '16px', fontWeight: 400, pl: '1%' }}>
                          {new Date(referendum.created_at).toDateString()}
                        </Grid>
                      </Grid>
                      <Grid item sx={{ textAlign: 'center', mb: '10px', color: 'white', fontSize: '16px', fontWeight: 400, border: '1px solid primary.main', borderRadius: '30px', bgcolor: STATUS_COLOR[referendum.status], p: '10px 15px' }} xs={1}>
                        {referendum.status}
                      </Grid>
                    </Grid>
                  </Grid>
                );
              }
            })}
          </>
          : <Grid container justifyContent='center' pt='13%'>
            <CubeGrid color={theme.palette.background.paper} size={200} col={3} row={3} />
          </Grid>
        }
      </Container>
    </>
  );
}
