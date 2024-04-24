// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';

import { PButton, ShowBalance, TwoButtons } from '../../components';
import { useTranslation } from '../../components/translate';
import { isEmail, isUrl } from '../../util/utils';
import SetIdentityForm from './partial/SetIdentityForm';
import { Mode, STEPS } from '.';

interface Props {
  api: ApiPromise | null | undefined;
  chainName: string | undefined;
  identity?: DeriveAccountRegistration | null;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setIdentityToSet: React.Dispatch<React.SetStateAction<DeriveAccountRegistration | null | undefined>>;
  totalDeposit: BN;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  mode: Mode;
  identityToSet: DeriveAccountRegistration | null | undefined;
}

export default function SetIdentity({ api, chainName, identity, identityToSet, mode, setIdentityToSet, setMode, setStep, totalDeposit }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [display, setDisplay] = useState<string | undefined>();
  const [legal, setLegal] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [website, setWebsite] = useState<string | undefined>();
  const [twitter, setTwitter] = useState<string | undefined>();
  const [riot, setRiot] = useState<string | undefined>();
  const [discord, setDiscord] = useState<string | undefined>();

  const hasBeenSet = useCallback((value: string | null | undefined) => {
    if (value === 'None' || value === null || value === undefined) {
      return undefined;
    } else {
      return value;
    }
  }, []);

  useEffect(() => {
    if (!identity && mode === 'Set') {
      return;
    }

    setDisplay(hasBeenSet(identity?.display));
    setLegal(hasBeenSet(identity?.legal));
    setEmail(hasBeenSet(identity?.email));
    setWebsite(hasBeenSet(identity?.web));
    setTwitter(hasBeenSet(identity?.twitter));
    setRiot(hasBeenSet(identity?.riot));
    setDiscord(hasBeenSet(identity?.other?.discord));
  }, [hasBeenSet, identity, mode]);

  useEffect(() => {
    if (!display) {
      return;
    }

    setIdentityToSet({
      display: display || undefined,
      email: email || undefined,
      image: undefined,
      judgements: [],
      legal: legal || undefined,
      other: discord ? { discord } : {},
      riot: riot || undefined,
      twitter: twitter || undefined,
      web: website || undefined
    });
  }, [discord, display, email, legal, riot, setIdentityToSet, twitter, website]);

  const nextBtnDisable = useMemo(() => {
    if (mode === 'Set') {
      return !(display && (email ? isEmail(email) : true) && (website ? isUrl(website) : true));
    } else {
      return !display ||
        (identityToSet?.display === identity?.display &&
          identityToSet?.legal === identity?.legal &&
          identityToSet?.email === identity?.email &&
          identityToSet?.web === identity?.web &&
          identityToSet?.twitter === identity?.twitter &&
          identityToSet?.riot === identity?.riot &&
          identityToSet?.other?.discord === identity?.other?.discord
        ) ||
        (email && !isEmail(email)) ||
        (website && !isUrl(website));
    }
  }, [display, email, identity?.display, identity?.email, identity?.legal, identity?.other?.discord, identity?.riot, identity?.twitter, identity?.web, identityToSet?.display, identityToSet?.email, identityToSet?.legal, identityToSet?.other?.discord, identityToSet?.riot, identityToSet?.twitter, identityToSet?.web, mode, website]);

  const goReview = useCallback(() => {
    !mode && setMode('Set');
    setStep(STEPS.REVIEW);
  }, [mode, setMode, setStep]);

  const goBack = useCallback(() => {
    setMode(undefined);
    setStep(STEPS.PREVIEW);
  }, [setMode, setStep]);

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      <Typography fontSize='30px' fontWeight={700} pb='20px' pt='25px'>
        {mode === 'Set'
          ? t('Set On-chain Identity')
          : t('Modify On-chain Identity')
        }
      </Typography>
      <Typography fontSize='14px' fontWeight={400}>
        {mode === 'Set'
          ? t('{{chainName}} provides a naming system that allows participants to add personal information to their on-chain account and subsequently ask for verification of this information by registrars.', { replace: { chainName } })
          : t('Update your on-chain identity with new values, noting that accounts with judgments will need a fresh request for any modifications.')
        }

      </Typography>
      <SetIdentityForm
        discord={discord}
        display={display}
        email={email}
        identity={identity}
        legal={legal}
        riot={riot}
        setDiscord={setDiscord}
        setDisplay={setDisplay}
        setEmail={setEmail}
        setLegal={setLegal}
        setRiot={setRiot}
        setTwitter={setTwitter}
        setWeb={setWebsite}
        twitter={twitter}
        web={website}
      />
      <Grid alignItems='center' container item justifyContent='space-between' m='auto' pt='15px'>
        <Grid container item sx={{ width: 'fit-content' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t('Deposit:')}
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <ShowBalance
              api={api}
              balance={totalDeposit}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
        <Grid container item width={mode === 'Set' ? '40%' : '70%'}>
          {mode === 'Set'
            ? <PButton
              _mt='1px'
              _onClick={goReview}
              disabled={!!nextBtnDisable}
              text={t('Next')}
            />
            : <TwoButtons
              disabled={!!nextBtnDisable}
              mt={'1px'}
              onPrimaryClick={goReview}
              onSecondaryClick={goBack}
              primaryBtnText={t('Next')}
              secondaryBtnText={t('Back')}
            />
          }
        </Grid>
      </Grid>
    </Grid>
  );
}
