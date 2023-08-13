// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Grid, Popover, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useChainName, useGenesisHashOptions } from '../hooks';
import { tieAccount } from '../messaging';
import { CHAINS_WITH_BLACK_LOGO, GOVERNANCE_CHAINS } from '../util/constants';
import getLogo from '../util/getLogo';
import { sanitizeChainName, upperCaseFirstChar } from '../util/utils';

interface Props {
  address: string | undefined;
}

function ChangeNetwork ({ address }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { pathname } = useLocation();
  const genesisHashes = useGenesisHashOptions();
  const currentChainNameFromAccount = useChainName(address);
  const [currentChainName, setCurrentChainName] = useState<string | undefined>(currentChainNameFromAccount);
  const [isTestnetEnabled, setIsTestnetEnabled] = useState<boolean>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const isTestnetDisabled = useCallback((name: string | undefined) => !isTestnetEnabled && name?.toLowerCase() === 'westend', [isTestnetEnabled]);
  const selectableNetworks = useMemo(() => {
    if (pathname.includes('governance')) {
      return genesisHashes.filter((genesisHash) => GOVERNANCE_CHAINS.includes(genesisHash.value));
    }

    return genesisHashes;
  }, [genesisHashes, pathname]);

  useEffect(() => {
    currentChainNameFromAccount && setCurrentChainName(currentChainNameFromAccount);
  }, [currentChainNameFromAccount]);

  useEffect(() => {
    setIsTestnetEnabled(window.localStorage.getItem('testnet_enabled') === 'true')
  }, []);

  const selectNetwork = useCallback((newChainName: string) => {
    setAnchorEl(null);

    if (isTestnetDisabled(newChainName)) {
      return;
    }

    const selectedGenesisHash = genesisHashes.find((option) => sanitizeChainName(option.text) === newChainName)?.value;

    setCurrentChainName(newChainName);
    address && selectedGenesisHash && tieAccount(address, selectedGenesisHash).catch((err) => {
      setCurrentChainName(currentChainNameFromAccount);
      console.error(err);
    });
  }, [address, currentChainNameFromAccount, genesisHashes, isTestnetDisabled]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const chainName = useCallback((text: string) => sanitizeChainName(text)?.toLowerCase(), []);

  const NetworkList = () => (
    <Grid container item sx={{ maxHeight: '550px', overflow: 'hidden', overflowY: 'scroll', width: '250px' }}>
      {selectableNetworks && selectableNetworks.length > 0 &&
        selectableNetworks.map((genesisHash, index) => {
          const selectedNetwork = chainName(genesisHash.text) === currentChainName?.toLocaleLowerCase();
          const sanitizeChainName = upperCaseFirstChar(chainName(genesisHash.text) ?? '');

          return (
            // eslint-disable-next-line react/jsx-no-bind
            <Grid container justifyContent='space-between' key={index} onClick={() => selectNetwork(sanitizeChainName)} sx={{ ':hover': { bgcolor: 'rgba(24, 7, 16, 0.1)' }, bgcolor: selectedNetwork ? 'rgba(186, 40, 130, 0.2)' : 'transparent', cursor: 'pointer', height: '45px', px: '15px' }}>
              <Grid alignItems='center' container item width='fit-content'>
                <Typography fontSize='16px' fontWeight={selectedNetwork ? 400 : 300}>
                  {genesisHash.text}
                </Typography>
              </Grid>
              {genesisHash.text !== 'Allow use on any chain' &&
                <Grid alignItems='center' container item pl='15px' width='fit-content'>
                  <Avatar
                    src={getLogo(chainName(genesisHash.text))}
                    sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(genesisHash.text) && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: 29, width: 29 }}
                    variant='square'
                  />
                </Grid>
              }
            </Grid>
          );
        })}
    </Grid>
  );

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Grid container item>
      <Grid aria-describedby={id} component='button' container item onClick={handleClick} sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'secondary.light', borderRadius: '50%', cursor: 'pointer', height: '40px', p: 0, width: '40px' }}>
        <Avatar
          src={getLogo(currentChainName)}
          sx={{
            bgcolor: 'transparent',
            borderRadius: '50%',
            filter: (CHAINS_WITH_BLACK_LOGO.includes(currentChainName ?? '') && theme.palette.mode === 'dark') ? 'invert(1)' : '',
            height: '34px',
            m: 'auto',
            width: '34px'
          }}
        />
      </Grid>
      <Popover
        PaperProps={{ sx: { border: '1px solid', borderColor: 'secondary.light', borderRadius: '7px', py: '5px' } }}
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom'
        }}
        id={id}
        onClose={handleClose}
        open={open}
        sx={{ mt: '5px' }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top'
        }}
      >
        <NetworkList />
      </Popover>
    </Grid>
  );
}

export default React.memo(ChangeNetwork);
