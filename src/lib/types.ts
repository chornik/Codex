import type { Prisma } from "@prisma/client";
export type FullCase = Prisma.SearchCaseGetPayload<{
  include: {
    hotel: true;
    attachments: true;
    candidates: true;
    searches: true;
    drafts: true;
    benefit: true;
  };
}>;
export type ListCase = Prisma.SearchCaseGetPayload<{
  include: {
    hotel: true;
    _count: { select: { candidates: true; attachments: true } };
  };
}>;
