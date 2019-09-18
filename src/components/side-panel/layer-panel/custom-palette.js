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
import {Button} from 'components/common/styled-components';
import {VertDots, Trash} from 'components/common/icons';
import {
  sortableContainer,
  sortableElement,
  sortableHandle
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import Modal from 'react-modal';
import ColorPalette from './color-palette';
import CustomPicker from './custom-picker';

const StyledWrapper = styled.div`
  color: #a0a7b4;
`;

const StyledHex = styled.div`
  color: #f0f0f0;
  font-size: 10px;
  padding-left: 10px;
  font-family: ff-clan-web-pro, 'Helvetica Neue', Helvetica, sans-serif;
  :hover {
    cursor: default;
  }
`;

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
  color: #fff
  :hover {
    cursor: move;
    opacity: 1;
    color: ${props => props.theme.textColorHl};
  }
`;

const StyledTrash = styled.div`
  .trashbin {
    color: #a0a7b4;
    :hover {
      color: #fff;
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
  width: 220px;
  height: 1px;
  background-color: #6a7485;
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

const StyledButton = styled(Button)`
  background-color: transparent;
  color: #A0A7B4
  :hover {
    background-color: transparent;
    color: #fff;
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

const DEFAULT_NEW_COLOR = '#F0F0F0';

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
    const newColors = [...colors];
    newColors.push(DEFAULT_NEW_COLOR);
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
    const newColors = [...colors];
    event.stopPropagation();
    event.preventDefault();
    this.props.onApply(
      {
        name: 'Custom Palette',
        type: null,
        category: 'Uber',
        colors: newColors
      },
      event
    );
  };

  _onSortEnd = ({oldIndex, newIndex}) => {
    const {colors} = this.props.customPalette;
    const newColors = arrayMove(colors, oldIndex, newIndex);
    this._setCustomPalette(newColors);
  };

  render() {
    const {colors} = this.props.customPalette;
    return (
      <StyledWrapper>
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

              <StyledHex>{color.toUpperCase()}</StyledHex>

              <StyledTrash onClick={() => this._onColorDelete(index)}>
                <Trash className="trashbin" />
              </StyledTrash>
            </SortableItem>
          ))}
        </SortableContainer>

        <StyledButton onClick={this._onColorAdd}>+ Add Step</StyledButton>

        <StyledLine />

        <StyledButtonContainer>
          <StyledButton onClick={this._onApply}>Confirm</StyledButton>
          <StyledButton onClick={this.props.onCancel}> Cancel</StyledButton>
        </StyledButtonContainer>
      </StyledWrapper>
    );
  }
}

export default CustomPalette;
