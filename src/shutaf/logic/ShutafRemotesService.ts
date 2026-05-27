import { IShutaf } from "../../data/entities/shutaf.interface";
import shutafimList from "../shutafim.json";

export class ShutafRemotesService {
  public static async fetchData(): Promise<[IShutaf]> {
    const response = shutafimList as [IShutaf];
    return response;
  }
}
