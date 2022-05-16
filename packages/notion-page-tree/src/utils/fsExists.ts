import { access } from 'fs';
const fsExists = (pathLike: string) =>
	new Promise<boolean>((resolve, reject) => {
		try {
			access(pathLike, err => {
				err ? resolve(false) : resolve(true);
			});
		} catch {
			reject();
		}
	});
export default fsExists;
