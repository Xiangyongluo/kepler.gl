// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  sortableContainer,
  sortableElement,
  sortableHandle
} from 'react-sortable-hoc';
import Modal from 'react-modal';
import {Button, InlineInput} from 'components/common/styled-components';
import {VertDots, Trash} from 'components/common/icons';
import ColorPalette from './color-palette';
import CustomPicker from './custom-picker';
import arrayMove from 'utils/data-utils';

const StyledSortableItem = styled.div`
  display: flex;
  align-items: center;
  padding-top: 6px;
  padding-bottom: 6px;
  z-index: 100;
  :hover {
    background-color: ${props => props.theme.panelBackgroundHover};

    .layer__drag-handle {
      opacity: 1;
      cursor: move;
    }

    .sortableColors {
      color: #fff;
    }
  }
`;

const StyledDragHandle = styled.div`
  display: flex;
  align-items: center;
  opacity: 0;
  z-index: 1000;
  color: ${props => props.theme.subtextColorActive};

  :hover {
    cursor: move;
    opacity: 1;
    color: ${props => props.theme.textColorHl};
  }
`;

const StyledTrash = styled.div`
  color: ${props => props.theme.textColor};
  svg {
    :hover {
      color: ${props => props.theme.subtextColorActive};
    }
  }
  height: 12px;
  margin-left: auto;
  margin-right: 12px;
  :hover {
    cursor: pointer;
  }
`;

const StyledLine = styled.div`
  width: calc(100% - 16px);
  height: 1px;
  background-color: ${props => props.theme.labelColor};
  margin-top: 8px;
  margin-left: 8px;
`;

const StyledSwatch = styled.div`
  background-color: ${props => props.color};
  width: 32px;
  height: 18px;
  display: inline-block;
  cursor: pointer;
`;

const StyledColorRange = styled.div`
  padding: 0 8px;
  :hover {
    background-color: ${props => props.theme.panelBackgroundHover};
    cursor: pointer;
  }
`;

const StyledButtonContainer = styled.div`
  margin-top: 11px;
  display: flex;
  direction: rtl;
`;

const StyledInlineInput = styled.div`
  margin-left: 12px;
  input {
    color: ${props => props.theme.textColorHl};
    font-size: 10px;
  }
`;

const customStyles = {
  content: {
    top: '30%',
    left: '340px',
    right: 'auto',
    bottom: 'auto',
    padding: '0px 0px 0px 0px',
    zIndex: 9999
  }
};

const SortableItem = sortableElement(({children}) => (
  <StyledSortableItem>{children}</StyledSortableItem>
));

const SortableContainer = sortableContainer(({children}) => (
  <div>{children}</div>
));

const DragHandle = sortableHandle(({className, children}) => (
  <StyledDragHandle className={className}>{children}</StyledDragHandle>
));

class CustomPalette extends Component {
  static propTypes = {
    customPalette: PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
      category: PropTypes.string,
      colors: PropTypes.arrayOf(PropTypes.string)
    }),
    setCustomPalette: PropTypes.func,
    showSketcher: PropTypes.bool,
    onToggleSketcher: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      currentSwatchIndex: null
    };
  }

  _setCustomPalette(colors) {
    this.props.setCustomPalette({
      name: 'Custom Palette',
      type: null,
      category: 'Uber',
      colors
    });
  }

  _onColorUpdate = color => {
    const {colors} = this.props.customPalette;
    const newColors = [...colors];
    newColors[this.state.currentSwatchIndex] = color.hex;
    this._setCustomPalette(newColors);
  };

  _onColorDelete = index => {
    const {colors} = this.props.customPalette;
    const newColors = [...colors];
    if (newColors.length > 1) {
      newColors.splice(index, 1);
    }
    this._setCustomPalette(newColors);
  };

  _onColorAdd = () => {
    const {colors} = this.props.customPalette;
    // add the last color
    const newColors = [...colors, colors[colors.length - 1]];
    this._setCustomPalette(newColors);
  };

  _onSwatchClick = index => {
    this.setState({
      currentSwatchIndex: index
    });
    this.props.onToggleSketcher();
  };

  _onSwatchClose = index => {
    this.props.onToggleSketcher();
  };

  _onApply = event => {
    const {colors} = this.props.customPalette;
    event.stopPropagation();
    event.preventDefault();
    this.props.onApply(
      {
        name: 'Custom Palette',
        type: null,
        category: 'custom',
        colors: [...colors]
      },
      event
    );
    this.props.onCancel();
  };

  _onSortEnd = ({oldIndex, newIndex}) => {
    const {colors} = this.props.customPalette;
    const newColors = arrayMove(colors, oldIndex, newIndex);
    this._setCustomPalette(newColors);
  };

  _inputColorHex = (index, {target: {value}}) => {
    const {colors} = this.props.customPalette;
    const newColors = [...colors];
    newColors[index] = value.toUpperCase();
    this._setCustomPalette(newColors);
  }

  render() {
    const {colors} = this.props.customPalette;
    return (
      <div className="custom-palette-panel">
        <StyledColorRange>
          <ColorPalette colors={colors} />
        </StyledColorRange>

        <SortableContainer
          className="custom-palette-container"
          onSortEnd={this._onSortEnd}
          lockAxis="y"
          useDragHandle={true}
          helperClass="sortableColors"
        >
          {colors.map((color, index) => (
            <SortableItem key={index} index={index}>
              <DragHandle className="layer__drag-handle">
                <VertDots height="20px" />
              </DragHandle>

              <StyledSwatch
                color={color}
                onClick={() => this._onSwatchClick(index)}
              />

              {this.props.showSketcher &&
              this.state.currentSwatchIndex === index ? (
                <div>
                  <Modal
                    isOpen={this.props.showSketcher}
                    style={customStyles}
                    ariaHideApp={false}
                  >
                    <CustomPicker
                      color={color}
                      onChange={this._onColorUpdate}
                      onSwatchClose={this._onSwatchClose}
                    />
                  </Modal>
                </div>
              ) : null}
              <StyledInlineInput>
                <InlineInput
                  type="text"
                  className="layer__title__editor"
                  value={color.toUpperCase()}
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  onChange={e => this._inputColorHex(index, e)}
                  id="input-layer-label"/>
              </StyledInlineInput>
              <StyledTrash onClick={() => this._onColorDelete(index)}>
                <Trash className="trashbin" />
              </StyledTrash>
            </SortableItem>
          ))}
        </SortableContainer>
        {/* Add Step Button */}
        <Button link onClick={this._onColorAdd}>+ Add Step</Button>
        <StyledLine />
        {/* Cancel or Confirm Buttons */}
        <StyledButtonContainer>
          <Button link onClick={this._onApply}>Confirm</Button>
          <Button link onClick={this.props.onCancel}> Cancel</Button>
        </StyledButtonContainer>
      </div>
    );
  }
}

export default CustomPalette;
