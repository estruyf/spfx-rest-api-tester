import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'RestTesterWebPartStrings';
import RestTester from './components/RestTester';
import { IRestTesterProps } from './components/IRestTesterProps';

export interface IRestTesterWebPartProps {
  data: any;
}

export default class RestTesterWebPart extends BaseClientSideWebPart<IRestTesterWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IRestTesterProps> = React.createElement(
      RestTester,
      {
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: []
            }
          ]
        }
      ]
    };
  }
}
