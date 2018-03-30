import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneLabel,
  PropertyPaneLink
} from '@microsoft/sp-webpart-base';

// import * as strings from 'RestTesterWebPartStrings';
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
            description: ""
          },
          groups: [
            {
              groupName: "Created by Elio Struyf",
              groupFields: [
                PropertyPaneLabel('', {
                  text: "Thank you for using the SP Rest API Tester. I initially created this project in order to make testing the SharePoint APIs easier without the hassle of using other tools / figuring out which headers to set."
                }),
                PropertyPaneLabel('', {
                  text: "If you have any feedback or issues, please add them to the issue list of the repository:"
                }),
                PropertyPaneLink('', {
                  href: "https://github.com/estruyf/spfx-rest-api-tester/issues",
                  text: "https://github.com/estruyf/spfx-rest-api-tester/issues",
                  target: "_blank"
                }),
                PropertyPaneLabel('', {
                  text: "If you want to know more about SharePoint / Office 365 development. Feel free to check out my blog:"
                }),
                PropertyPaneLink('', {
                  href: "https://www.eliostruyf.com",
                  text: "https://www.eliostruyf.com",
                  target: "_blank"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
