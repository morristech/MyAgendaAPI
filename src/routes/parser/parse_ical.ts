import { Request, Response } from "express"
import { readAndParseFile } from "../../utils"
import { getLangMsg } from "../../utils/messages"
import icalFromUrl from "./ical"

const parseIcal = async (req: Request, res: Response) => {
    const { univId, resId } = req.params
    const { firstDate, lastDate } = req.query

    if (!univId || !resId || !firstDate || !lastDate) {
        res.status(400).send({ error: getLangMsg(req, "missing_ical_parse_arguments") })
        return
    }

    if (univId === "null") {
        res.status(400).send({ error: getLangMsg(req, "missing_university_id") })
        return
    }

    try {
        const data: any[] = await readAndParseFile(req, "./data/agendas/resources.json")
        const univData = data.find((univ: any) => univ.id === univId)

        if (!univData) {
            res.status(400).send({ error: getLangMsg(req, "unknown_university_id") })
            return
        }

        const univUrl = univData.agendaUrl
            .replace("%res%", resId)
            .replace("%firstDate%", firstDate)
            .replace("%lastDate%", lastDate)

        const vevents = await icalFromUrl(univUrl)
        res.send({ data: { vevents } })
    } catch (error) {
        res.status(400).send({ error })
    }
}

export default parseIcal