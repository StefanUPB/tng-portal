import { Injectable } from "@angular/core";
import { ConfigService } from ".././config/config.service";
import { AuthService } from ".././auth/auth.service";

import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from "@angular/common/http";
import { timeout } from "q";

@Injectable()
export class ServicePlatformService {
  authHeaders: HttpHeaders;
  request_uuid: string;
  // pagination: string = "?page_size=20&page_number=1";

  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private http: HttpClient
  ) {}

  /**
   * Retrieves a list of Packages.
   * Either following a search pattern or not.
   *
   * @param search [Optional] Packages attributes that must be
   *                          matched by the returned list of
   *                          packages.
   */
  getPackages(search?): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();
      let url =
        search != undefined
          ? this.config.base + this.config.packages + search
          : this.config.base + this.config.packages;

      this.http
        .get(url, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          if (response instanceof Array) {
            resolve(
              response.map(item => {
                return {
                  uuid: item.uuid,
                  name: item.pd.name,
                  vendor: item.pd.vendor,
                  createdAt: item.created_at,
                  version: item.pd.version,
                  type: "public"
                };
              })
            );
          } else {
            reject();
          }
        })
        .catch(err => reject(err.statusText));
    });
  }

  /**
   * Retrieves a Package by UUID
   *
   * @param uuid UUID of the desired Package.
   */
  getOnePackage(uuid: string): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();
      this.http
        .get(this.config.base + this.config.packages + "/" + uuid, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          resolve({
            uuid: response["uuid"],
            name: response["pd"]["name"],
            author: response["pd"]["maintainer"],
            createdAt: response["created_at"],
            vendor: response["pd"]["vendor"],
            version: response["pd"]["version"],
            type: "public",
            package_file_id: response["package_file_id"]
          });
        })
        .catch(err => reject(err.statusText));
    });
  }

  /**
   * Retrieves a list of Functions.
   * Either following a search pattern or not.
   *
   * @param search [Optional] Packages attributes that must be
   *                          matched by the returned list of
   *                          packages.
   */
  getFunctions(search?): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();
      let url =
        search != undefined
          ? this.config.base + this.config.functions + search
          : this.config.base + this.config.functions;

      this.http
        .get(url, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          if (response instanceof Array) {
            resolve(
              response.map(item => {
                return {
                  uuid: item.uuid,
                  name: item.vnfd.name,
                  vendor: item.vnfd.vendor,
                  status: item.status,
                  version: item.vnfd.version,
                  type: "public"
                };
              })
            );
          } else {
            reject();
          }
        })
        .catch(err => reject(err.statusText));
    });
  }

  /**
   * Retrieves a Function by UUID
   *
   * @param uuid UUID of the desired Function.
   */
  getOneFunction(uuid: string): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();
      this.http
        .get(this.config.base + this.config.functions + "/" + uuid, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          resolve({
            uuid: response["uuid"],
            name: response["vnfd"]["name"],
            author: response["vnfd"]["author"],
            createdAt: response["created_at"],
            updatedAt: response["updated_at"],
            vendor: response["vnfd"]["vendor"],
            version: response["vnfd"]["version"],
            type: "public",
            status: response["status"],
            description: response["vnfd"]["description"]
          });
        })
        .catch(err => reject(err.statusText));
    });
  }

  /**
   * Retrieves a SLA Template by UUID
   *
   * @param uuid UUID of the desired SLA Template.
   */
  getOneSLATemplate(uuid): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();
      this.http
        .get(this.config.base + this.config.slaTemplates + "/" + uuid, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          resolve({
            uuid: response["uuid"],
            name: response["slad"]["name"],
            author: response["slad"]["author"],
            createdAt: response["created_at"],
            expirationDate: new Date(
              Date.parse(response["slad"]["sla_template"]["valid_until"])
            ),
            ns: response["slad"]["sla_template"]["ns"]["ns_name"],
            storedGuarantees:
              response["slad"]["sla_template"]["ns"]["guaranteeTerms"]
          });
        })
        .catch(err => reject(err.statusText));
    });
  }

  /**
   * Retrieves a list with all the service guarantees
   */
  getServiceGuarantees(): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();

      this.http
        .get(this.config.base + this.config.guarantees, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          resolve(response["guaranteeTerms"]);
        })
        .catch(err => {
          reject(err.statusText);
        });
    });
  }

  /**
   * Creates a new SLA Template.
   *
   * @param template Object containing the nsd_uuid, guaranteeId, expireDate
   *                 and templateName for the creation of a new template.
   */
  postOneSLATemplate(template): any {
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.config.base + this.config.slaTemplates,
          this.urlEncode(template),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .toPromise()
        .then(response => {
          resolve();
        })
        .catch(err => reject(err.statusText));
    });
  }

  urlEncode(obj: Object): string {
    let str: string = "";
    Object.keys(obj).forEach(key => {
      if (obj[key] instanceof Array) {
        obj[key].forEach(item => {
          str +=
            (str.length > 0 ? "&" : "") +
            encodeURI(key) +
            "=" +
            encodeURI(item);
        });
      } else {
        str +=
          (str.length > 0 ? "&" : "") +
          encodeURI(key) +
          "=" +
          encodeURI(obj[key]);
      }
    });
    return str;
  }

  /**
   * Removes the specified template from the database
   *
   * @param uuid UUID of the desired SLA Template.
   */
  deleteOneSLATemplate(uuid: string): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();

      this.http
        .delete(this.config.base + this.config.slaTemplates + "/" + uuid, {
          headers: headers,
          responseType: "text"
        })
        .toPromise()
        .then(response => {
          resolve();
        })
        .catch(err => {
          reject(err.statusText);
        });
    });
  }

  /**
   * Retrieves a list of SLA Agreements.
   * Either following a search pattern or not.
   *
   * @param search [Optional] Agreement attributes that must be
   *                          matched by the returned list of
   *                          SLA Agreements.
   */
  getSLAAgreements(search?): any {
    return new Promise((resolve, reject) => {
      // let headers = this.authService.getAuthHeaders();
      // let url =
      //   search != undefined
      //     ? this.config.base + this.config.slaAgreements + search
      //     : this.config.base + this.config.slaAgreements;
      // this.http
      //   .get(url, {
      //     headers: headers
      //   })
      //   .toPromise()
      //   .then(response => {
      //     resolve(
      //       response["cust_sla"].map(item => {
      //         return {
      //           uuid: item.sla_uuid,
      //           name: item.sla_name,
      //           ns: item.ns_name,
      //           customer: item.cust_email,
      //           date: item.sla_date,
      //           status: item.sla_status
      //         };
      //       })
      //     );
      //   })
      //   .catch(err => reject(err.statusText));

      setTimeout(() => {
        resolve([
          {
            status: "active",
            uuid: "45217851155",
            name: "sla1",
            ns: "ns1",
            customer: "customer1",
            date: new Date().toISOString()
          }
        ]);
      }, 1000);
    });
  }

  /**
   * Retrieves a SLA Agreement by UUID
   *
   * @param uuid UUID of the desired SLA Agreement.
   */
  getOneSLAAgreement(uuid): any {
    return new Promise((resolve, reject) => {
      // let headers = this.authService.getAuthHeaders();
      // this.http
      //   .get(this.config.base + this.config + "/" + uuid, {
      //     headers: headers
      //   })
      //   .toPromise()
      //   .then(response => {
      //     resolve({
      //       uuid: response["uuid"],
      //       name: response["name"],
      //       author: response["author"],
      //       date: response["date"],
      //       ns: response["ns"],
      //       customer: response["customer"],
      //       propertyList: response["propertyList"],
      //       availability: response["availability"],
      //       cost: response["cost"],
      //     });
      //   })
      //   .catch(err => reject(err.statusText));

      setTimeout(() => {
        resolve({
          uuid: uuid,
          name: "name",
          author: "author",
          date: new Date().toISOString(),
          ns: "A",
          customer: "customer1",
          propertyList: [
            {
              property: "property_1",
              guarantee: "guarantee_1"
            },
            { property: "property_22", guarantee: "guarantee_22" }
          ],
          availability: "90%",
          cost: "100€/month"
        });
      }, 1000);
    });
  }

  /**
   * Retrieves a list of Slices Templates.
   * Either following a search pattern or not.
   *
   * @param search [Optional] Template attributes that must be
   *                          matched by the returned list of
   *                          Slices Templates.
   */
  getSlicesTemplates(search?): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();
      let url =
        search != undefined
          ? this.config.base + this.config.slicesTemplates + search
          : this.config.base + this.config.slicesTemplates;

      this.http
        .get(url, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          if (response instanceof Array) {
            resolve(
              response.map(item => {
                return {
                  uuid: item.uuid,
                  name: item.nstd.name,
                  version: item.nstd.version,
                  vendor: item.nstd.vendor,
                  usageState: item.nstd.usageState,
                  author: item.nstd.author,
                  status: item.status
                };
              })
            );
          } else {
            reject();
          }
        })
        .catch(err => reject(err.statusText));
    });
  }

  /**
   * Removes the specified template from the database
   *
   * @param uuid UUID of the desired Slices Template.
   */
  deleteOneSlicesTemplate(uuid: string): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();

      this.http
        .delete(this.config.base + this.config.slicesTemplates + "/" + uuid, {
          headers: headers,
          responseType: "text"
        })
        .toPromise()
        .then(response => {
          resolve();
        })
        .catch(err => {
          reject(err.statusText);
        });
    });
  }

  /**
   * Retrieves a Slices Template by UUID
   *
   * @param uuid UUID of the desired Slices Template.
   */
  getOneSliceTemplate(uuid): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();

      this.http
        .get(this.config.base + this.config.slicesTemplates + "/" + uuid, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          resolve({
            uuid: response["uuid"],
            status: response["status"],
            name: response["nstd"]["name"],
            author: response["nstd"]["author"],
            createdAt: response["created_at"],
            version: response["nstd"]["version"],
            vendor: response["nstd"]["vendor"],
            notificationType: response["nstd"]["notificationTypes"],
            userDefinedData: response["nstd"]["userDefinedData"],
            usageState: response["nstd"]["usageState"],
            onboardingState: response["nstd"]["onboardingState"],
            operationalState: response["nstd"]["operationalState"],
            nstNsdIds: response["nstd"]["nstNsdIds"]
          });
        })
        .catch(err => reject(err.statusText));
    });
  }

  /**
   * Retrieves a list of Slices Instances.
   * Either following a search pattern or not.
   *
   * @param search [Optional] Instances attributes that must be
   *                          matched by the returned list of
   *                          Slices instances.
   */
  getSlicesInstances(search?): any {
    return new Promise((resolve, reject) => {
      // let headers = this.authService.getAuthHeaders();
      // let url =
      //   search != undefined
      //     ? this.config.base + this.config.slicesInstances + search
      //     : this.config.base + this.config.slicesInstances;

      // this.http
      //   .get(url, {
      //     headers: headers
      //   })
      //   .toPromise()
      //   .then(response => {
      //     if (response instanceof Array) {
      //       resolve(
      //         response.map(item => {
      //           return {
      //             uuid: item.id,
      //             name: item.name,
      //             vendor: item.vendor,
      //             nstRef: item.nstd.nstRef,
      //             state: item.nsiState
      //           };
      //         })
      //       );
      //     } else {
      //       reject();
      //     }
      //   })
      //   .catch(err => reject(err.statusText));

      setTimeout(() => {
        resolve([
          {
            uuid: "deb3a1fc-2493-4d76-a65d-9ac129a213fb",
            name: "Rubik_name",
            vendor: "5gTango",
            nstRef: "item.nstRef",
            state: "INSTANTIATED"
          }
        ]);
      }, 1000);
    });
  }

  /**
   * Retrieves a Slices Instances by UUID
   *
   * @param uuid UUID of the desired Slices Instance.
   */
  getOneSliceInstance(uuid): any {
    return new Promise((resolve, reject) => {
      // let headers = this.authService.getAuthHeaders();

      // this.http
      //   .get(this.config.base + this.config.slicesInstances + "/" + uuid, {
      //     headers: headers
      //   })
      //   .toPromise()
      //   .then(response => {
      //     resolve({
      //       uuid: response["uuid"],
      //       name: response["name"],
      //       version: response["version"],
      //       vendor: response["vendor"],
      //       state: response["nsiState"],
      //       description: response["description"],
      //       netServInstanceUUID: response["netServInstance_Uuid"]
      //       nstName: response["nstName"]

      //     });
      //   })
      //   .catch(err => reject(err.statusText));

      setTimeout(() => {
        resolve({
          uuid: "deb3a1fc-2493-4d76-a65d-9ac129a213fb",
          name: "Rubik_name",
          vendor: "5gTango",
          state: "INSTANTIATED",
          description: "Rubik_descriptor",
          netServInstanceUUID: ["dc8fafaf-6fab-4b4c-a6c7-a1fb5d4c2ce8"],

          nstName: "nstName",
          version: "0.4"
        });
      }, 1000);
    });
  }

  /**
   * Generates a Slice Instance
   *
   * @param instance Data of the desired Slice Instance.
   */
  postOneSliceInstance(instance): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();

      this.http
        .post(this.config.base + this.config.slicesInstances, instance, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          resolve();
        })
        .catch(err => reject(err.statusText));
    });
  }

  /**
   * Terminates a Slice Instance by UUID
   *
   * @param uuid UUID of the desired Slices Instance.
   */
  postOneSliceInstanceTermination(uuid): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();
      const terminateTime = {
        terminateTime: new Date().toISOString()
      };

      this.http
        .post(
          this.config.base +
            this.config.slicesInstances +
            "/" +
            uuid +
            "/terminate",
          terminateTime,
          {
            headers: headers
          }
        )
        .toPromise()
        .then(response => {
          resolve();
        })
        .catch(err => reject(err.statusText));
    });
  }
}
