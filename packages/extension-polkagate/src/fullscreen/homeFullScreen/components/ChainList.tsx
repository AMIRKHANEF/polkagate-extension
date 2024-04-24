// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { InputFilter } from '../../../components';
import { getStorage, setStorage } from '../../../components/Loading';
import { useGenesisHashOptions, useIsTestnetEnabled, useTranslation } from '../../../hooks';
import { ASSETS_NAME_IN_STORAGE, SavedAssets } from '../../../hooks/useAssetsBalances';
import { TEST_NETS } from '../../../util/constants';
import { DEFAULT_SELECTED_CHAINS } from '../../../util/defaultSelectedChains';
import { DropdownOption } from '../../../util/types';
import ChainItem from './ChainItem';

interface Props {
  anchorEl: HTMLButtonElement | null;
}

const DEFAULT_SELECTED_CHAINS_COUNT = 10;

function ChainList({ anchorEl }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const allChains = useGenesisHashOptions(false);
  const isTestnetEnabled = useIsTestnetEnabled();

  const [showOtherChains, setShowOtherChains] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchedChain, setSearchedChain] = useState<DropdownOption[]>();
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set());

  useEffect(() => {
    const defaultSelectedGenesisHashes = DEFAULT_SELECTED_CHAINS.map(({ value }) => value as string);

    getStorage('selectedChains').then((res) => {
      (res as string[])?.length
        ? setSelectedChains(new Set(res as string[]))
        : setSelectedChains(new Set(defaultSelectedGenesisHashes));
    }).catch(console.error);
  }, [allChains]);

  const updateSavedAssetsInStorage = useCallback(() => {
    getStorage(ASSETS_NAME_IN_STORAGE, true).then((assets: SavedAssets) => {
      assets && Object.keys(assets.balances).forEach((addresses) => {
        Object.keys(assets.balances[addresses]).forEach((genesisHash) => {
          if (!selectedChains.has(genesisHash)) {
            assets.balances[addresses][genesisHash] && delete assets.balances[addresses][genesisHash];
          }
        });
      });
      setStorage(ASSETS_NAME_IN_STORAGE, assets, true).catch(console.error);
    }).catch(console.error);
  }, [selectedChains]);

  const handleChainsChanges = useCallback(() => {
    setStorage('selectedChains', [...selectedChains]).catch(console.error);
    updateSavedAssetsInStorage();
  }, [selectedChains, updateSavedAssetsInStorage]);

  useEffect(() => {
    if (anchorEl === null) {
      setShowOtherChains(false);
      setSearchKeyword('');
      selectedChains?.size &&
        handleChainsChanges();
    }
  }, [anchorEl, handleChainsChanges, selectedChains]);

  const onChainSelect = useCallback((chain: DropdownOption) => {
    setSelectedChains((prevChains) => {
      const updatedChains = new Set(prevChains);

      if (updatedChains.has(chain.value as string)) {
        updatedChains.delete(chain.value as string);
      } else {
        updatedChains.add(chain.value as string);
      }

      return updatedChains;
    });
  }, []);

  const onOtherChains = useCallback(() => setShowOtherChains(!showOtherChains), [showOtherChains]);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      setSearchKeyword('');

      return setSearchedChain(undefined);
    }

    setSearchKeyword(keyword);
    keyword = keyword.trim().toLowerCase();

    const _filtered = allChains.filter(({ text }) => text.toLowerCase().includes(keyword));

    setSearchedChain([..._filtered]);
  }, [allChains]);

  return (
    <Grid container item sx={{ maxHeight: '650px', overflow: 'hidden', overflowY: 'scroll', transition: 'height 5000ms ease-in-out', width: '280px' }}>
      <Grid container item justifyContent='center'>
        <Typography fontSize='16px' fontWeight={500} pt='10px'>
          {t('Select chains to view assets on')}
        </Typography>
      </Grid>
      <Divider sx={{ bgcolor: 'divider', height: '2px', my: '10px', width: '100%' }} />
      {[...allChains.slice(0, DEFAULT_SELECTED_CHAINS_COUNT)].map((item, index) => (
        <ChainItem
          chain={item}
          disabled={!isTestnetEnabled && TEST_NETS.includes(item.value as string)}
          isSelected={selectedChains.has(item.value as string)}
          key={index}
          onclick={onChainSelect}
        />
      ))}
      <Grid container item onClick={onOtherChains} sx={{ bgcolor: 'secondary.main', borderRadius: '5px', cursor: 'pointer' }}>
        <ArrowForwardIosRoundedIcon
          sx={{
            color: 'background.default',
            fontSize: '20px',
            m: 'auto',
            stroke: `${theme.palette.background.default}`,
            strokeWidth: 1.5,
            transform: showOtherChains ? 'rotate(-90deg)' : 'rotate(90deg)',
            transition: 'transform 150ms ease-in-out'
          }}
        />
      </Grid>
      <Collapse in={showOtherChains} sx={{ width: '100%' }} timeout={{ enter: 700, exit: 150 }}>
        <Grid container py='5px' sx={{ display: 'list-item' }}>
          <InputFilter
            autoFocus
            onChange={onSearch}
            placeholder={t<string>('🔍 Search chain')}
            theme={theme}
            value={searchKeyword ?? ''}
          />
        </Grid>
        {[...(searchedChain ?? allChains.slice(DEFAULT_SELECTED_CHAINS_COUNT))].map((item, index) => (
          <ChainItem
            chain={item}
            disabled={!isTestnetEnabled && TEST_NETS.includes(item.value as string)}
            isSelected={selectedChains.has(item.value as string)}
            key={index}
            onclick={onChainSelect}
          />
        ))}
      </Collapse>
    </Grid>
  );
}

export default React.memo(ChainList);
