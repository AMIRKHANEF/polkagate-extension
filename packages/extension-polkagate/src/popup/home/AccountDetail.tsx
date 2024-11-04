// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { FetchedBalance } from '../../hooks/useAssetsBalances';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { AvatarGroup, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
// @ts-ignore
import { Wordpress } from 'better-react-spinkit';
import React, { useCallback, useMemo } from 'react';

import { AssetLogo, Infotip, Infotip2, OptionalCopyButton, VaadinIcon } from '../../components';
import { AccountTotal } from '../../fullscreen/homeFullScreen/partials/AccountInformationForHome';
import { useAccountAssets, useCurrency, usePrices, useTranslation } from '../../hooks/';
import getLogo2 from '../../util/getLogo2';
import { amountToHuman } from '../../util/utils';

interface Props {
  address: string;
  chain: Chain | null | undefined;
  formatted: string | undefined | null;
  hideNumbers: boolean | undefined;
  identity: DeriveAccountRegistration | null | undefined;
  isHidden: boolean | undefined;
  goToAccount: () => void;
  menuOnClick: () => void;
  name: string | undefined;
  toggleVisibility: () => void;
}

interface EyeProps {
  toggleVisibility: () => void;
  isHidden: boolean | undefined;
}

const EyeButton = React.memo(function EyeButton ({ isHidden, toggleVisibility }: EyeProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Infotip text={isHidden ? t('This account is hidden from websites') : t('This account is visible to websites')}>
      <IconButton onClick={toggleVisibility} sx={{ height: '15px', ml: '5px', p: 0, width: '24px' }}>
        <VaadinIcon icon={isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ color: `${theme.palette.secondary.light}`, height: '17px' }} />
      </IconButton>
    </Infotip>
  );
});

const NoChainAlert = React.memo(function NoChainAlert ({ chain, menuOnClick }: {chain: Chain | null | undefined, menuOnClick: () => void}) {
  const { t } = useTranslation();

  return (
    <>
      {chain === null
        ? <Grid alignItems='center' color='text.primary' container onClick={menuOnClick} sx={{ cursor: 'pointer', lineHeight: '27px', textDecoration: 'underline' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
            {t('Select a chain to view balance')}
          </Typography>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 12, mb: '-1px', stroke: '#BA2882' }} />
        </Grid>
        : <Skeleton animation='wave' height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={'95%'} />
      }
    </>
  );
});

const Assets = React.memo(function Assets ({ accountAssets }: { accountAssets: FetchedBalance[] | null | undefined }) {
  const theme = useTheme();

  const logosToShow = useMemo(() => {
    if (!accountAssets) {
      return accountAssets;
    }

    const logoInfos =
      accountAssets
        .filter(({ totalBalance }) => !totalBalance.isZero())
        .slice(0, 6)
        .map(({ genesisHash, token }) => ({ ...getLogo2(genesisHash, token), genesisHash }));

    return logoInfos;
  }, [accountAssets]);

  if (logosToShow === null) {
    return <></>;
  }

  if (logosToShow === undefined) {
    return (
      <Grid alignItems='center' container item pt='5px' px='10px' width='fit-content'>
        <Wordpress
          color={theme.palette.text.disabled}
          size={18}
          timingFunction='linear'
        />
      </Grid>
    );
  }

  return (
    <Grid alignItems='center' container item sx={{ mx: '10px', width: 'fit-content' }}>
      <Infotip2 text={accountAssets && accountAssets.length === 1 ? 'Asset' : 'Assets'}>
        <AvatarGroup
          max={6}
          spacing={3}
          sx={{
            '> .MuiAvatar-root': {
              border: theme.palette.mode === 'dark' ? 1 : 'unset',
              borderColor: 'secondary.contrastText',
              borderWidth: '1px'
            },
            '> div .MuiAvatar-root:not(:last-child)': {
              border: theme.palette.mode === 'dark' ? 1 : 'unset',
              borderColor: 'secondary.contrastText',
              borderWidth: '1px'
            }
          }}
        >
          {logosToShow?.map(({ genesisHash, logo, subLogo }, index) => (
            <AssetLogo assetSize='18px' baseTokenSize='8px' genesisHash={genesisHash} key={index} logo={logo} subLogo={subLogo} />
          ))}
        </AvatarGroup>
      </Infotip2>
    </Grid>
  );
});

function AccountDetail ({ address, chain, goToAccount, hideNumbers, identity, isHidden, menuOnClick, name, toggleVisibility }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const pricesInCurrencies = usePrices();
  const currency = useCurrency();
  const accountAssets = useAccountAssets(address);

  const calculatePrice = useCallback((amount: BN, decimal: number, price: number) => parseFloat(amountToHuman(amount, decimal)) * price, []);

  const totalBalance = useMemo(() => {
    if (accountAssets && pricesInCurrencies && currency) {
      const t = accountAssets.reduce((accumulator, { decimal, priceId, totalBalance }) => (accumulator + calculatePrice(totalBalance, decimal, pricesInCurrencies.prices?.[priceId]?.value ?? 0)), 0);

      return t;
    } else if (accountAssets === null) {
      return 0;
    }

    return undefined;
    /** we need currency as a dependency to update balance by changing currency*/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountAssets, calculatePrice, currency, pricesInCurrencies]);

  return (
    <Grid container direction='column' sx={{ rowGap: '5px', width: '70%' }}>
      <Grid alignItems='center' container direction='row' item sx={{ lineHeight: '20px' }}>
        <Grid item maxWidth='70%' onClick={goToAccount} sx={{ cursor: 'pointer' }}>
          <Typography fontSize='28px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
            {identity?.display || name || t('Unknown')}
          </Typography>
        </Grid>
        <Grid item>
          <EyeButton
            isHidden={isHidden}
            toggleVisibility={toggleVisibility}
          />
        </Grid>
        <Grid item sx={{ width: 'fit-content' }}>
          <OptionalCopyButton address={address} size='18px' />
        </Grid>
      </Grid>
      <Grid alignItems='center' container item>
        {!chain
          ? <NoChainAlert
            chain={chain}
            menuOnClick={menuOnClick}
          />
          : <Grid alignItems='center' container>
            <AccountTotal
              hideNumbers={hideNumbers}
              isExtensionMode
              totalBalance={totalBalance}
            />
            <Assets accountAssets={accountAssets} />
          </Grid>
        }
      </Grid>
    </Grid>
  );
}

export default React.memo(AccountDetail);
