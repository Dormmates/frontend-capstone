import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export interface BreadcrumbItemProps {
  name: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItemProps[];
  backHref?: string;
}

const Breadcrumbs = ({ items, backHref }: BreadcrumbsProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex items-center gap-2">
        {backHref && (
          <BreadcrumbItem>
            <Link to={backHref}>
              <Button variant="outline" size="sm" className="flex items-center gap-1 px-2">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
          </BreadcrumbItem>
        )}

        {items.map((item, index) => (
          <React.Fragment key={item.name}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.name}</Link>
                </BreadcrumbLink>
              ) : (
                <span>{item.name}</span>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
