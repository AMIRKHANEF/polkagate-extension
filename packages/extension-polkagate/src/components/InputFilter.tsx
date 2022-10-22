// Copyright 2017-2022 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Theme } from '@mui/material';
import React, { useCallback, useRef } from 'react';

import Label from './Label';
import { Input } from './TextInputs';

interface Props {
  onChange: (filter: string) => void;
  label: string;
  placeholder: string;
  value: string;
  withReset?: boolean;
  theme: Theme;
}

export default function InputFilter({ label, onChange, placeholder, theme, value, withReset = false }: Props) {
  const inputRef: React.RefObject<HTMLInputElement> | null = useRef(null);

  const onChangeFilter = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  }, [onChange]);

  const onResetFilter = useCallback(() => {
    onChange('');
    inputRef.current && inputRef.current.select();
  }, [onChange]);

  return (
    <div>
      <Label
        label={label}
      >
        <Input
          autoCapitalize='off'
          autoCorrect='off'
          autoFocus
          onChange={onChangeFilter}
          placeholder={placeholder}
          ref={inputRef}
          spellCheck={false}
          style={{
            fontSize: '18px',
            fontWeight: 300,
            padding: 0,
            paddingLeft: '10px'
          }}
          theme={theme}
          type='text'
          value={value}
        />
      </Label>
      {
        withReset && !!value && (
          <FontAwesomeIcon
            icon={faTimes}
            onClick={onResetFilter}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              right: '25px',
              top: '32px'
            }}
          />
        )
      }
    </div>
  );
}
