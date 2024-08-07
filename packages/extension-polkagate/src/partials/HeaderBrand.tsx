// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Step } from '../util/types';

import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowBackIos as ArrowBackIosIcon, Close as CloseIcon, Menu as MenuIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Box, Container, Divider, Grid, IconButton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useRef, useState } from 'react';

import { logoBlack, logoWhite } from '../assets/logos';
import { ActionContext, FullScreenIcon, Steps, VaadinIcon } from '../components';
import useOutsideClick from '../hooks/useOutsideClick';
import ConnectedDappIcon from './ConnectedDappIcon';
import Menu from './Menu';
import { AccountMenu } from '.';

interface Props {
  address?: string;
  showBackArrow?: boolean;
  showBrand?: boolean;
  showMenu?: boolean;
  showAccountMenu?: boolean;
  withSteps?: Step | null;
  text?: React.ReactNode;
  onBackClick?: () => void;
  onRefresh?: () => void;
  showClose?: boolean;
  showCloseX?: boolean;
  isRefreshing?: boolean;
  _centerItem?: React.JSX.Element;
  noBorder?: boolean;
  shortBorder?: boolean;
  paddingBottom?: number;
  onClose?: () => void;
  backgroundDefault?: boolean;
  showFullScreen?: boolean;
  fullScreenURL?: string;
  style?: SxProps<Theme> | undefined;
}

const LeftIcon = ({ onBackClick, showBackArrow, showBrand }: {
  showBrand: boolean | undefined;
  onBackClick?: () => void;
  showBackArrow?: boolean;
}) => {
  const theme = useTheme();

  return (
    <Grid item xs={showBrand ? 1.4 : 1}>
      {!showBrand &&
        <ArrowBackIosIcon
          onClick={onBackClick}
          sx={{
            color: 'secondary.light',
            cursor: 'pointer',
            fontSize: 25,
            stroke: theme.palette.secondary.light,
            strokeWidth: 1.5,
            visibility: showBackArrow ? 'visible' : 'hidden'
          }}
        />}
      {!showBackArrow && showBrand &&
        <Grid item sx={{ position: 'relative', width: 'fit-content' }}>
          <Box
            component='img'
            src={theme.palette.mode === 'dark' ? logoBlack as string : logoWhite as string}
            sx={{ height: 52, width: 52 }}
          />
          <ConnectedDappIcon />
        </Grid>
      }
    </Grid>
  );
};

function HeaderBrand ({ _centerItem, address, backgroundDefault, fullScreenURL = '/', isRefreshing, noBorder = false, onBackClick, onClose, onRefresh, paddingBottom = 11, shortBorder, showAccountMenu, showBackArrow, showBrand, showClose, showCloseX, showFullScreen = false, showMenu, style, text, withSteps = null }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const setIconRef = useRef(null);
  const setMenuRef = useRef(null);

  const [isMenuOpen, setOpenMenu] = useState(false);
  const [isAccountMenuOpen, setShowAccountMenu] = useState(false);

  useOutsideClick([setIconRef, setMenuRef], (): void => {
    isMenuOpen && setOpenMenu(!isMenuOpen);
  });

  const _handleMenuClick = useCallback(() => {
    if (address) {
      setShowAccountMenu((open) => !open);
    } else {
      setOpenMenu((open) => !open);
    }
  }, [address]);

  const _onClose = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const CenterItem = () => (
    <Grid display='inline-flex' item>
      <Typography color='text.primary' fontFamily={showBrand ? 'Eras' : 'inherit'} fontWeight={400} sx={{ fontSize: showBrand ? '30px' : '20px', lineHeight: showBrand ? 'inherit' : 1.9 }}>
        {text}
      </Typography>
      {
        withSteps &&
        <Steps
          current={withSteps.current}
          total={withSteps.total}
        />
      }
    </Grid>
  );

  const RightItem = () => (
    <Grid item textAlign='right' xs={showFullScreen && showAccountMenu ? 2.7 : 1.4}>
      {!onRefresh && !showClose &&
        <Grid container direction='row' item width='fit-content'>
          {showFullScreen &&
            <FullScreenIcon url={fullScreenURL} />
          }
          <IconButton aria-label='menu' color='inherit' edge='start' onClick={_handleMenuClick} size='small' sx={{ p: 0, visibility: showMenu || showAccountMenu ? 'visible' : 'hidden' }}>
            {showMenu &&
              <MenuIcon
                sx={{ color: showBrand ? theme.palette.mode === 'dark' ? 'text.primary' : 'secondary.light' : 'secondary.light', fontSize: 39 }}
              />
            }
            {showAccountMenu &&
              <MoreVertIcon
                sx={{ color: 'secondary.light', fontSize: '33px' }}
              />
            }
          </IconButton>
        </Grid>
      }
      {!!onRefresh &&
        <IconButton aria-label='menu' color='inherit' edge='start' onClick={onRefresh} size='small' sx={{ p: 0 }}>
          <FontAwesomeIcon
            color={theme.palette.secondary.light}
            icon={faRefresh}
            size='lg'
            spin={isRefreshing}
          />
        </IconButton>
      }
      {showClose &&
        <IconButton aria-label='menu' color='inherit' edge='start' onClick={onClose || _onClose} size='small' sx={{ p: 0 }}>
          {showCloseX
            ? <CloseIcon sx={{ fontSize: 40 }} />
            : <VaadinIcon icon={`vaadin:home${theme.palette.mode === 'light' ? '-o' : ''}`} style={{ color: `${theme.palette.secondary.light}`, height: '22px', width: '22px' }} />
          }
        </IconButton>
      }
    </Grid>
  );

  return (
    <>
      <Container
        disableGutters
        sx={{
          bgcolor: backgroundDefault ? 'background.default' : showBrand ? 'background.paper' : 'transparent',
          borderBottom: `${noBorder || shortBorder ? 'none' : '0.5px solid'}`,
          borderColor: 'secondary.light',
          lineHeight: 0,
          p: showBrand ? '7px 30px 7px' : `18px ${showFullScreen ? '5px' : '20px'} ${paddingBottom}px 20px`,
          ...style
        }}
      >
        <Grid alignItems='center' container justifyContent='space-between'>
          <LeftIcon
            onBackClick={onBackClick}
            showBackArrow={showBackArrow}
            showBrand={showBrand}
          />
          {_centerItem ?? <CenterItem />}
          <RightItem />
        </Grid>
        {shortBorder &&
          <Divider sx={{ bgcolor: 'secondary.main', height: '3px', margin: '5px auto', width: '138px' }} />
        }
      </Container>
      {isMenuOpen &&
        <Menu
          setShowMenu={setOpenMenu}
          theme={theme}
        />
      }
      {isAccountMenuOpen && address &&
        <AccountMenu
          address={address}
          isMenuOpen={isAccountMenuOpen}
          noMargin
          setShowMenu={setShowAccountMenu}
        />
      }
    </>
  );
}

export default React.memo(HeaderBrand);
